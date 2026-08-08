using CASE_STUDY_7_Models.Domain;
using CASE_STUDY_7_Models.Interfaces;
using CASE_STUDY_Core.Engine;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace CASE_STUDY_Core.Cache
{
    public class PnlStateCache : IPnlStateCache

    {
        // Store: Date -> (SecurityId -> Position State)
        private readonly ConcurrentDictionary<DateOnly, ConcurrentDictionary<string, SecurityPositionState>> _store = new();
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
        private readonly IServiceScopeFactory _scopeFactory;

        // Dataset start date: 2 Feb 2026
        private static readonly DateOnly InceptionDate = new DateOnly(2026, 02, 02);

        public PnlStateCache(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }


        public IReadOnlyList<(DateOnly Date, SecurityPositionState State)> GetHistoryFromCache(string securityId, DateOnly maxDate)
        {
            // Filter and return already-cached keys in memory without running SQL or engine loops
            return _store.Keys
                .Where(d => d <= maxDate && _store[d].ContainsKey(securityId))
                .OrderBy(d => d)
                .Select(d => (Date: d, State: _store[d][securityId].DeepClone()))
                .ToList();
        }

        public async Task<SecurityPositionState> GetPositionStateAsync(string securityId, DateOnly asOfDate)
        {
            // O(1) direct lookup if already computed
            if (_store.TryGetValue(asOfDate, out var dayStore) && dayStore.TryGetValue(securityId, out var state))
            {
                return state.DeepClone();
            }

            var semaphore = _locks.GetOrAdd(securityId, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();

            try
            {
                if (_store.TryGetValue(asOfDate, out dayStore) && dayStore.TryGetValue(securityId, out state))
                {
                    return state.DeepClone();
                }

                // Find highest cached date
                var maxCachedDate = _store.Keys
                    .Where(d => _store[d].ContainsKey(securityId))
                    .OrderByDescending(d => d)
                    .Select(d => (DateOnly?)d)
                    .FirstOrDefault();

                DateOnly startDate = maxCachedDate.HasValue ? maxCachedDate.Value.AddDays(1) : InceptionDate;

                SecurityPositionState currentState = maxCachedDate.HasValue
                    ? _store[maxCachedDate.Value][securityId].DeepClone()
                    : new SecurityPositionState { SecurityId = securityId };

                using (var scope = _scopeFactory.CreateScope())
                {
                    var tradeRepo = scope.ServiceProvider.GetRequiredService<ITradeRepository>();
                    var calcEngine = scope.ServiceProvider.GetRequiredService<IPnlCalculatorEngine>();

                    // Fetch trades up to target date
                    var allTrades = await tradeRepo.GetTradesUpToDateAsync(asOfDate, securityId);

                    // Roll forward strictly day by day from startDate to asOfDate
                    for (var currentDate = startDate; currentDate <= asOfDate; currentDate = currentDate.AddDays(1))
                    {
                        var todaysTrades = allTrades
                            .Where(t => t.TradeDate == currentDate)
                            .OrderBy(t => t.TradeId);

                        foreach (var trade in todaysTrades)
                        {
                            calcEngine.ProcessTrade(currentState, trade.BuySell, trade.Quantity, trade.Price);
                        }

                        // Store every single day's snapshot in memory
                        var dayDict = _store.GetOrAdd(currentDate, _ => new ConcurrentDictionary<string, SecurityPositionState>());
                        dayDict[securityId] = currentState.DeepClone();
                    }
                }

                return currentState;
            }
            finally
            {
                semaphore.Release();
            }
        }
    }
}
