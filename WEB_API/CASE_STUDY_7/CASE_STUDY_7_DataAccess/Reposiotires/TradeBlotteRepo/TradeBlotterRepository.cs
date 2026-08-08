using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
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
            var query = _context.VwTradeBlotters.AsNoTracking().AsQueryable();

            // Apply active filters using helper
            query = ApplyFilters(query, request);

            var totalCount = await query.CountAsync(cancellationToken);

            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var items = await query
                .OrderByDescending(x => x.TradeDate)
                .ThenByDescending(x => x.TradeId)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new TradeBlotterItemDto
                {
                    TradeId = x.TradeId,
                    TradeDate = x.TradeDate,
                    SecurityId = x.SecurityId,
                    SecurityName = x.SecurityName,
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
            var query = _context.VwTradeBlotters.AsNoTracking().AsQueryable();

            // Reuses exact same filter logic
            query = ApplyFilters(query, request);

            // Database Aggregations via pure EF Core LINQ
            var totalNotionalVolume = await query
                .SumAsync(x => (decimal?)(x.Quantity * x.Price), cancellationToken) ?? 0m;

            var totalTradeCount = await query
                .CountAsync(cancellationToken);

            var buyNotionalVolume = await query
                .Where(x => x.BuySell.ToUpper() == "BUY")
                .SumAsync(x => (decimal?)(x.Quantity * x.Price), cancellationToken) ?? 0m;

            var sellNotionalVolume = await query
                .Where(x => x.BuySell.ToUpper() == "SELL")
                .SumAsync(x => (decimal?)(x.Quantity * x.Price), cancellationToken) ?? 0m;

            var traderBreakdown = await query
                .GroupBy(x => x.TraderName)
                .Select(g => new
                {
                    TraderName = g.Key,
                    TotalVolume = g.Sum(x => x.Quantity * x.Price)
                })
                .OrderByDescending(x => x.TotalVolume)
                .ToListAsync(cancellationToken);

            // Returns anonymous object directly (No new DTO required)
            return new
            {
                TotalNotionalVolume = totalNotionalVolume,
                TotalTradeCount = totalTradeCount,
                BuyNotionalVolume = buyNotionalVolume,
                SellNotionalVolume = sellNotionalVolume,
                TraderBreakdown = traderBreakdown
            };
        }

        private static IQueryable<VwTradeBlotter> ApplyFilters(
    IQueryable<VwTradeBlotter> query,
    TradeBlotterRequestDto request)
        {
            if (request.FromDate.HasValue)
            {
                query = query.Where(x => x.TradeDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(x => x.TradeDate <= request.ToDate.Value);
            }

            // Fix for SecurityIds: Split any comma-delimited strings inside the list
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

            // Fix for TraderIds: Split any comma-delimited strings and parse to INTs
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

            return query;
        }
    }
}