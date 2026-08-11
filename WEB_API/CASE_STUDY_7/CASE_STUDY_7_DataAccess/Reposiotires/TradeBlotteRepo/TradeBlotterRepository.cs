using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
using CASE_STUDY_7_DataAccess.Services;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CASE_STUDY_7_DataAccess.Reposiotires.TradeBlotteRepo
{
    public class TradeBlotterRepository : ITradeBlotterRepository
    {
        private readonly Vantage7Context _context;
        private readonly ILogger<TradeBlotterRepository> _logger; 

        public TradeBlotterRepository(Vantage7Context context, ILogger<TradeBlotterRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TradeBlotterPagedResultDto> GetTradeBlotterAsync(TradeBlotterRequestDto request,CancellationToken cancellationToken = default)
        {
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var query = _context.VwTradeBlotters.AsNoTracking().AsQueryable();

            query = ApplyFilters(query, request);

            var totalCount = await query.CountAsync(cancellationToken);

            if (request.IsDescending)
            {
                query = query.OrderByDescending(x => x.TradeDate).ThenByDescending(x => x.TradeId);
            }
            else
            {
                query = query.OrderBy(x => x.TradeDate).ThenBy(x => x.TradeId);
            }

            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize)
                .Select(x => new TradeBlotterItemDto
                {
                    TradeId = x.TradeId,
                    TradeDate = x.TradeDate,
                    SecurityId = x.SecurityId,
                    SecurityName = x.SecurityName,
                    AssetClass = x.AssetClass,
                    TraderId = x.TraderId,
                    TraderName = x.TraderName,
                    BuySell = x.BuySell,
                    Quantity = x.Quantity,
                    Price = x.Price,
                    GrossNotionalAmount = x.GrossNotionalAmount ?? (x.Quantity * x.Price)
                }).ToListAsync(cancellationToken);

            _logger.LogInformation("Fetched {FetchedCount} trade items for Page {PageNumber} (Total records matching filter: {TotalCount})",
                items.Count, pageNumber, totalCount);

            return new TradeBlotterPagedResultDto
            {
                TotalRecords = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Items = items
            };
        }

        public async Task<object> GetTradeBlotterAnalyticsAsync(TradeBlotterRequestDto request, CancellationToken cancellationToken = default)
        {
            var baseQuery = _context.VwTradeBlotters.AsNoTracking().AsQueryable();

            if (request.FromDate.HasValue)
                baseQuery = baseQuery.Where(x => x.TradeDate >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                baseQuery = baseQuery.Where(x => x.TradeDate <= request.ToDate.Value);

            if (request.SecurityIds != null && request.SecurityIds.Any())
                baseQuery = baseQuery.Where(x => request.SecurityIds.Contains(x.SecurityId));

            var fullyFilteredQuery = baseQuery;
            if (request.AssetClasses != null && request.AssetClasses.Any())
                fullyFilteredQuery = fullyFilteredQuery.Where(x => request.AssetClasses.Contains(x.AssetClass));
            if (request.TraderIds != null && request.TraderIds.Any())
                fullyFilteredQuery = fullyFilteredQuery.Where(x => request.TraderIds.Contains(x.TraderId));

            var traderQuery = baseQuery;
            if (request.AssetClasses != null && request.AssetClasses.Any())
                traderQuery = traderQuery.Where(x => request.AssetClasses.Contains(x.AssetClass));

            var assetClassQuery = baseQuery;
            if (request.TraderIds != null && request.TraderIds.Any())
                assetClassQuery = assetClassQuery.Where(x => request.TraderIds.Contains(x.TraderId));

            var summaryMetrics = await fullyFilteredQuery
                .GroupBy(x => 1)
                .Select(g => new
                {
                    TotalNotionalVolume = g.Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m,
                    TotalTradeCount = g.Count(),
                    BuyNotionalVolume = g.Where(x => x.BuySell.ToUpper() == "BUY")
                                         .Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m,
                    SellNotionalVolume = g.Where(x => x.BuySell.ToUpper() == "SELL")
                                          .Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m
                })
                .FirstOrDefaultAsync(cancellationToken);

            var traderBreakdown = await traderQuery
                .GroupBy(x => new { x.TraderId, x.TraderName })
                .Select(g => new
                {
                    TraderId = g.Key.TraderId,
                    TraderName = string.IsNullOrEmpty(g.Key.TraderName) ? "Unknown" : g.Key.TraderName,
                    TotalVolume = g.Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m
                })
                .OrderByDescending(x => x.TotalVolume)
                .ToListAsync(cancellationToken);

            var assetClassBreakdown = await assetClassQuery
                .GroupBy(x => x.AssetClass)
                .Select(g => new
                {
                    AssetClass = string.IsNullOrEmpty(g.Key) ? "Unassigned" : g.Key,
                    TotalVolume = g.Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m
                })
                .OrderByDescending(x => x.TotalVolume)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Computed Trade Blotter Analytics. Total Volume: {TotalVolume:C}, Total Trades: {TotalTrades}",
                summaryMetrics?.TotalNotionalVolume ?? 0m, summaryMetrics?.TotalTradeCount ?? 0);

            return new
            {
                TotalNotionalVolume = summaryMetrics?.TotalNotionalVolume ?? 0m,
                TotalTradeCount = summaryMetrics?.TotalTradeCount ?? 0,
                BuyNotionalVolume = summaryMetrics?.BuyNotionalVolume ?? 0m,
                SellNotionalVolume = summaryMetrics?.SellNotionalVolume ?? 0m,
                AssetClassBreakdown = assetClassBreakdown,
                TraderBreakdown = traderBreakdown
            };
        }
        public async Task<Stream> ExportTradeBlotterToStreamAsync(TradeBlotterRequestDto request, CancellationToken cancellationToken = default)
        {
            var query = _context.VwTradeBlotters.AsNoTracking().AsQueryable();

            query = ApplyFilters(query, request);

            var items = await query
                .OrderByDescending(x => x.TradeDate)
                .ThenByDescending(x => x.TradeId)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Exporting {Count} trades to CSV stream", items.Count);

            string headers = "Trade ID,Trade Date,Asset Class,Security,Trader,Side,Quantity,Price,Gross Notional";

            return CsvExportService.BuildCsvStream(headers, items, x =>
                $"\"{x.TradeId}\",\"{x.TradeDate:yyyy-MM-dd}\",\"{x.AssetClass ?? "-"}\",\"{x.SecurityName ?? x.SecurityId}\",\"{x.TraderName ?? x.TraderId.ToString()}\",\"{x.BuySell}\",{x.Quantity},{x.Price:F2},{(x.GrossNotionalAmount ?? (x.Quantity * x.Price)):F2}"
            );
        }

        private static IQueryable<VwTradeBlotter> ApplyFilters(IQueryable<VwTradeBlotter> query, TradeBlotterRequestDto request)
        {
            if (request.FromDate.HasValue)
            {
                query = query.Where(x => x.TradeDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(x => x.TradeDate <= request.ToDate.Value);
            }

            if (request.SecurityIds != null && request.SecurityIds.Any())
            {
                var cleanSecurityIds = request.SecurityIds
                    .SelectMany(s => s.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();

                if (cleanSecurityIds.Any())
                {
                    query = query.Where(t => cleanSecurityIds.Contains(t.SecurityId));
                }
            }

            if (request.TraderIds != null && request.TraderIds.Any())
            {
                var cleanTraderIds = request.TraderIds
                    .SelectMany(s => s.ToString().Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(s => int.TryParse(s, out int val) ? (int?)val : null)
                    .Where(v => v.HasValue)
                    .Select(v => v!.Value)
                    .ToList();

                if (cleanTraderIds.Any())
                {
                    query = query.Where(t => cleanTraderIds.Contains(t.TraderId));
                }
            }

            if (request.AssetClasses != null && request.AssetClasses.Any())
            {
                var cleanAssetClasses = request.AssetClasses
                    .SelectMany(s => s.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();

                if (cleanAssetClasses.Any())
                {
                    query = query.Where(t => cleanAssetClasses.Contains(t.AssetClass));
                }
            }

            return query;
        }
    }
}