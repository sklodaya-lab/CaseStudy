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

        public async Task<IEnumerable<PnlSummaryDto>> GetPnLSummaryAsync(DateOnly asOfDate, IEnumerable<string>? securityIds = null)
        {
            // Convert to a HashSet for O(1) lookup during filtering
            var secIdSet = securityIds != null && securityIds.Any()
                ? new HashSet<string>(securityIds.Where(id => !string.IsNullOrWhiteSpace(id)), StringComparer.OrdinalIgnoreCase)
                : null;

            // 1. Fetch securities (filtered by list if provided)
            var securitiesQuery = _context.Securities.AsNoTracking();

            if (secIdSet != null && secIdSet.Count > 0)
            {
                securitiesQuery = securitiesQuery.Where(s => secIdSet.Contains(s.SecurityId));
            }

            var securities = await securitiesQuery.ToListAsync();

            // 2. Fetch closing prices for all securities as of target date
            var prices = await _priceRepo.GetLatestPricesForAllAsync(asOfDate);

            // 3. Process the filtered list of securities concurrently
            var summaryTasks = securities.Select(async security =>
            {
                var positionState = await _stateCache.GetPositionStateAsync(security.SecurityId, asOfDate);

                decimal closePrice = prices.TryGetValue(security.SecurityId, out var p) ? p : security.StartPrice;
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

        public async Task<IEnumerable<PnlTimeSeriesDTO>> GetPnlTimeSeriesAsync(string securityId, DateOnly? asOfDate = null)
        {
            var maxDate = asOfDate ?? new DateOnly(2026, 03, 31);

            // 1. Extract already-cached daily snapshots
            var cachedHistory = _stateCache.GetHistoryFromCache(securityId, maxDate);

            // 2. Fetch prices as of target date
            var prices = await _priceRepo.GetLatestPricesForAllAsync(maxDate);

            // 3. Project to DTOs instantly
            var timeSeries = new List<PnlTimeSeriesDTO>();

            foreach (var (date, state) in cachedHistory)
            {
                var priceOnDate = await _priceRepo.GetLatestPriceAsync(securityId, date);
                decimal closePrice = priceOnDate ?? 0m;
                decimal unrealizedPnL = _calcEngine.CalculateUnrealizedPnL(state, closePrice);

                timeSeries.Add(new PnlTimeSeriesDTO
                {
                    ValuationDate = date,
                    SecurityId = securityId,
                    NetPosition = state.NetQuantity,
                    WeightedAverageCost = state.WeightedAverageCost,
                    ClosingPrice = closePrice,
                    RealizedPnL = state.RealizedPnL,
                    MtmUnrealizedPnL = unrealizedPnL
                });
            }

            return timeSeries;
        }
    }
}
