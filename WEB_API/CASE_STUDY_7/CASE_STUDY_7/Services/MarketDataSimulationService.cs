using CASE_STUDY_7.Hubs;
using CASE_STUDY_7_Models.Interfaces;
using CASE_STUDY_Core.Engine;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CASE_STUDY_7.Services
{
        public class MarketDataSimulationService : BackgroundService

        {
            private readonly IHubContext<PnLHub> _hubContext;
            private readonly IServiceScopeFactory _scopeFactory;
            private readonly ConcurrentDictionary<string, decimal> _livePrices = new();

            public MarketDataSimulationService(
                IHubContext<PnLHub> hubContext,
                IServiceScopeFactory scopeFactory)
            {
                _hubContext = hubContext;
                _scopeFactory = scopeFactory;
            }

            protected override async Task ExecuteAsync(CancellationToken stoppingToken)
            {
                // 1. Initialize live prices from database EOD prices
                using (var scope = _scopeFactory.CreateScope())
                {
                    var priceRepo = scope.ServiceProvider.GetRequiredService<IPriceRepository>();
                    var initialPrices = await priceRepo.GetLatestPricesForAllAsync(new DateOnly(2026, 03, 31));

                    foreach (var kvp in initialPrices)
                    {
                        _livePrices[kvp.Key] = kvp.Value;
                    }
                }

                // 2. Continuous Ticker Loop while application is running
                while (!stoppingToken.IsCancellationRequested)
                {
                    foreach (var securityId in _livePrices.Keys.ToList())
                    {
                        decimal oldPrice = _livePrices[securityId];
                        decimal newPrice = PriceSimulatorEngine.GenerateNextPrice(oldPrice);

                        _livePrices[securityId] = newPrice;

                        // 3. Broadcast lightweight payload over WebSocket
                        await _hubContext.Clients.All.SendAsync("ReceivePriceUpdate", new
                        {
                            SecurityId = securityId,
                            Price = newPrice,
                            PriceChange = newPrice - oldPrice,
                            Timestamp = DateTime.UtcNow
                        }, stoppingToken);
                    }

                    // Tick frequency delay (1.5 seconds)
                    await Task.Delay(1500, stoppingToken);
                }
            }
        }
}
