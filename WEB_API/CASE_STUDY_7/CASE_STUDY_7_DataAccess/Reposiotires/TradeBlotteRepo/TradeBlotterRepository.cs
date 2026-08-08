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

        // Shared Filter Engine
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

            if (request.SecurityIds != null && request.SecurityIds.Any())
            {
                query = query.Where(t => request.SecurityIds.Contains(t.SecurityId));
            }

            if (request.TraderIds != null && request.TraderIds.Any())
            {
                query = query.Where(t => request.TraderIds.Contains(t.TraderId));
            }

            return query;
        }
    }
}