using CASE_STUDY_7.DataAccess;
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

            if (request.FromDate.HasValue)
            {
                query = query.Where(x => x.TradeDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(x => x.TradeDate <= request.ToDate.Value);
            }

            // Updated: Check if SecurityIds list has elements, then apply .Contains()
            if (request.SecurityIds != null && request.SecurityIds.Any())
            {
                query = query.Where(t => request.SecurityIds.Contains(t.SecurityId));
            }

            // Updated: Check if TraderIds list has elements, then apply .Contains()
            if (request.TraderIds != null && request.TraderIds.Any())
            {
                query = query.Where(t => request.TraderIds.Contains(t.TraderId));
            }

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
    }
}