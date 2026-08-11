using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
using CASE_STUDY_7_DataAccess.Services;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CASE_STUDY_7_DataAccess.Reposiotires.TradeBlotteRepo
{
    public class TradeBlotterRepository : ITradeBlotterRepository
    {
        private readonly Vantage7Context _context;

        public TradeBlotterRepository(Vantage7Context context)
        {
            _context = context;
        }

        public async Task<TradeBlotterPagedResultDto> GetTradeBlotterAsync(
            TradeBlotterRequestDto request,
            CancellationToken cancellationToken = default)
        {
            var query = _context.VwTradeBlotters
    .FromSqlRaw("SELECT * FROM g7.vw_TradeBlotter WITH (NOEXPAND)")
    .AsNoTracking()
    .AsQueryable();

            // Proceed with ApplyFilters(query, request)...

            query = ApplyFilters(query, request);

            var totalCount = await query.CountAsync(cancellationToken);

            if (request.IsDescending)
            {
                query = query.OrderByDescending(x => x.TradeDate)
                             .ThenByDescending(x => x.TradeId);
            }
            else
            {
                query = query.OrderBy(x => x.TradeDate)
                             .ThenBy(x => x.TradeId);
            }

            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
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
                    GrossNotionalAmount = x.GrossNotionalAmount ?? 0m
                })
                .ToListAsync(cancellationToken);

            return new TradeBlotterPagedResultDto
            {
                TotalRecords = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = items
            };
        }

        public async Task<object> GetTradeBlotterAnalyticsAsync(
    TradeBlotterRequestDto request,
    CancellationToken cancellationToken = default)
        {
            var query = _context.VwTradeBlotters
    .FromSqlRaw("SELECT * FROM g7.vw_TradeBlotter WITH (NOEXPAND)")
    .AsNoTracking()
    .AsQueryable();

            // Proceed with ApplyFilters(query, request)...

            query = ApplyFilters(query, request);

            var summaryMetrics = await query
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

            var totalNotionalVolume = summaryMetrics?.TotalNotionalVolume ?? 0m;
            var totalTradeCount = summaryMetrics?.TotalTradeCount ?? 0;
            var buyNotionalVolume = summaryMetrics?.BuyNotionalVolume ?? 0m;
            var sellNotionalVolume = summaryMetrics?.SellNotionalVolume ?? 0m;

            var traderBreakdown = await query
                .GroupBy(x => x.TraderName)
                .Select(g => new
                {
                    TraderName = string.IsNullOrEmpty(g.Key) ? "Unknown" : g.Key,
                    TotalVolume = g.Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m
                })
                .OrderByDescending(x => x.TotalVolume)
                .ToListAsync(cancellationToken);

            var assetClassBreakdown = await query
                .GroupBy(x => x.AssetClass)
                .Select(g => new
                {
                    AssetClass = string.IsNullOrEmpty(g.Key) ? "Unassigned" : g.Key,
                    TotalVolume = g.Sum(x => (decimal?)(x.Quantity * x.Price)) ?? 0m
                })
                .OrderByDescending(x => x.TotalVolume)
                .ToListAsync(cancellationToken);

            return new
            {
                TotalNotionalVolume = totalNotionalVolume,
                TotalTradeCount = totalTradeCount,
                BuyNotionalVolume = buyNotionalVolume,
                SellNotionalVolume = sellNotionalVolume,
                AssetClassBreakdown = assetClassBreakdown,
                TraderBreakdown = traderBreakdown
            };
        }

        private static IQueryable<VwTradeBlotter> ApplyFilters(IQueryable<VwTradeBlotter> query,TradeBlotterRequestDto request)
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

        public async Task<Stream> ExportTradeBlotterToStreamAsync(TradeBlotterRequestDto request, CancellationToken cancellationToken = default)
        {
            var query = _context.VwTradeBlotters
    .FromSqlRaw("SELECT * FROM g7.vw_TradeBlotter WITH (NOEXPAND)")
    .AsNoTracking()
    .AsQueryable();

            // Proceed with ApplyFilters(query, request)...

            query = ApplyFilters(query, request);

            var items = await query
                .OrderByDescending(x => x.TradeDate)
                .ThenByDescending(x=>x.TradeId)
                .ToListAsync(cancellationToken);

            string headers = "Trade ID,Trade Date,Asset Class,Security,Trader,Side,Quantity,Price,Gross Notional";

            return CsvExportService.BuildCsvStream(headers, items, x =>
                $"\"{x.TradeId}\",\"{x.TradeDate:yyyy-MM-dd}\",\"{x.AssetClass ?? "-"}\",\"{x.SecurityName ?? x.SecurityId}\",\"{x.TraderName ?? x.TraderId.ToString()}\",\"{x.BuySell}\",{x.Quantity},{x.Price:F2},{(x.GrossNotionalAmount ?? (x.Quantity * x.Price)):F2}"
            );
        }

    }
}