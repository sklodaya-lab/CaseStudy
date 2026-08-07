using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CASE_STUDY_Core.Services
{
    public class PnlCalculationService : IPnlCalculationService
    {
        private readonly IPnlStateCache _stateCache;
        private readonly IPriceRepository _priceRepo;
        private readonly IPnlCalculatorEngine _calcEngine;
        private readonly Vantage7Context _context;

        public PnlCalculationService(
            IPnlStateCache stateCache,
            IPriceRepository priceRepo,
            IPnlCalculatorEngine calcEngine,
            Vantage7Context context)
        {
            _stateCache = stateCache;
            _priceRepo = priceRepo;
            _calcEngine = calcEngine;
            _context = context;
        }

        public async Task<IEnumerable<PnlSummaryDto>> GetPnLSummaryAsync(DateOnly asOfDate, string? securityId = null)
        {
            // 1. Fetch all securities (or filter by specific security)
            var securitiesQuery = _context.Securities.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(securityId))
            {
                securitiesQuery = securitiesQuery.Where(s => s.SecurityId == securityId);
            }
            var securities = await securitiesQuery.ToListAsync();

            // 2. Fetch closing prices for all securities as of target date
            var prices = await _priceRepo.GetLatestPricesForAllAsync(asOfDate);

            // 3. Process securities in parallel across threads
            var summaryTasks = securities.Select(async security =>
            {
                // Ensures all daily states from start to asOfDate are hydrated in cache
                var positionState = await _stateCache.GetPositionStateAsync(security.SecurityId, asOfDate);

                // Get closing price (fallback to StartPrice if no EOD price exists)
                decimal closePrice = prices.TryGetValue(security.SecurityId, out var p) ? p : security.StartPrice;

                // Calculate Mark-to-Market Unrealized PnL
                decimal unrealizedPnL = _calcEngine.CalculateUnrealizedPnL(positionState, closePrice);

                return new PnlSummaryDto
                {
                    SecurityId = security.SecurityId,
                    SecurityName = security.SecurityName,
                    AssetClass = security.AssetClass,
                    NetPosition = positionState.NetQuantity,
                    WeightedAverageCost = positionState.WeightedAverageCost,
                    ClosingPrice = closePrice,
                    RealizedPnL = positionState.RealizedPnL,
                    MtmUnrealizedPnL = unrealizedPnL
                };
            });

            var results = await Task.WhenAll(summaryTasks);
            return results.OrderBy(r => r.SecurityId);
        }
    }
}
