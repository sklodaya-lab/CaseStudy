using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
using CASE_STUDY_7_DataAccess.Repositories;
using CASE_STUDY_7_Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace CASE_STUDY_7_Test
{
    public class TradeBlotterRepositoryTests
    {
        private Vantage7Context GetDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<Vantage7Context>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new TestVantage7Context(options);

            context.VwTradeBlotters.AddRange(new List<VwTradeBlotter>
            {
                new VwTradeBlotter
                {
                    TradeId = 1,
                    TradeDate = new DateOnly(2026, 1, 15),
                    SecurityId = "EQ04",
                    SecurityName = "Apple Inc",
                    AssetClass = "Equity",
                    TraderId = 5,
                    TraderName = "Raghav Singh",
                    BuySell = "BUY",
                    Quantity = 100,
                    Price = 150.00m,
                    GrossNotionalAmount = 15000.00m
                },
                new VwTradeBlotter
                {
                    TradeId = 2,
                    TradeDate = new DateOnly(2026, 1, 20),
                    SecurityId = "FI01",
                    SecurityName = "US Treasury Bond",
                    AssetClass = "Fixed Income",
                    TraderId = 6,
                    TraderName = "Neha Sharma",
                    BuySell = "SELL",
                    Quantity = 200,
                    Price = 1000.00m,
                    GrossNotionalAmount = 200000.00m
                }
            });

            context.SaveChanges();
            return context;
        }

        private static T GetProperty<T>(object obj, string propertyName)
        {
            var prop = obj.GetType().GetProperty(propertyName);
            return (T)prop?.GetValue(obj)!;
        }

        [Fact]
        public async Task GetTradeBlotterAsync_NoFilters_ReturnsAllPagedRecords()
        {
            using var context = GetDbContext("Db_AllRecords");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto { PageNumber = 1, PageSize = 10 };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal(2, result.TotalRecords);
            Assert.Equal(2, result.Items.Count);
        }

        [Fact]
        public async Task GetTradeBlotterAsync_DateRangeFilter_ReturnsMatchingDatesOnly()
        {
            using var context = GetDbContext("Db_DateFilter");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto
            {
                FromDate = new DateOnly(2026, 1, 10),
                ToDate = new DateOnly(2026, 1, 18)
            };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.Equal(1, result.TotalRecords);
            Assert.Equal(1, result.Items.First().TradeId);
        }

        [Fact]
        public async Task GetTradeBlotterAsync_CommaSeparatedSecurityIds_ParsesAndFiltersCorrectly()
        {
            using var context = GetDbContext("Db_CommaSecurities");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto
            {
                SecurityIds = new List<string> { "EQ04, FI01" }
            };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.Equal(2, result.TotalRecords);
        }

        [Fact]
        public async Task GetTradeBlotterAsync_FilterByTraderIdAndAssetClass_ReturnsMatchingRecord()
        {
            using var context = GetDbContext("Db_TraderAssetClassFilter");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto
            {
                TraderIds = new List<int> { 5 },
                AssetClasses = new List<string> { "Equity" }
            };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.Equal(1, result.TotalRecords);
            Assert.Equal(5, result.Items.First().TraderId);
            Assert.Equal("Equity", result.Items.First().AssetClass);
        }

        [Theory]
        [InlineData("NON_EXISTENT", false)]
        [InlineData("EQ04", true)]
        public async Task GetTradeBlotterAsync_FilterBySecurityId_HandlesExistence(string securityId, bool exists)
        {
            using var context = GetDbContext($"Db_SecCheck_{securityId}");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto { SecurityIds = new List<string> { securityId } };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            if (exists)
            {
                Assert.Equal(1, result.TotalRecords);
            }
            else
            {
                Assert.Equal(0, result.TotalRecords);
                Assert.Empty(result.Items);
            }
        }

        [Fact]
        public async Task GetTradeBlotterAsync_FutureDateRange_ReturnsZeroRecords()
        {
            using var context = GetDbContext("Db_FutureDate");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto
            {
                FromDate = new DateOnly(2027, 1, 1),
                ToDate = new DateOnly(2027, 12, 31)
            };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.Equal(0, result.TotalRecords);
            Assert.Empty(result.Items);
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(-1, -5)] // Negative bounds -> Falls back safely
        public async Task GetTradeBlotterAsync_InvalidPaginationBounds_FallsBackToDefaults(int pageNum, int pageSize)
        {
            using var context = GetDbContext($"Db_Pagination_{pageNum}_{pageSize}");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto { PageNumber = pageNum, PageSize = pageSize };

            var result = await repo.GetTradeBlotterAsync(request, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal(2, result.TotalRecords);
        }

        [Fact]
        public async Task GetTradeBlotterAnalyticsAsync_ValidData_CalculatesCorrectTotals()
        {
            using var context = GetDbContext("Db_Analytics_Pos");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto();

            var result = await repo.GetTradeBlotterAnalyticsAsync(request, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal(215000m, GetProperty<decimal>(result, "TotalNotionalVolume"));
            Assert.Equal(2, GetProperty<int>(result, "TotalTradeCount"));
            Assert.Equal(15000m, GetProperty<decimal>(result, "BuyNotionalVolume"));
            Assert.Equal(200000m, GetProperty<decimal>(result, "SellNotionalVolume"));
        }

        [Fact]
        public async Task GetTradeBlotterAnalyticsAsync_NoMatchingRecords_ReturnsZeroedTotalsGracefully()
        {
            using var context = GetDbContext("Db_Analytics_Neg");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto { SecurityIds = new List<string> { "NON_EXISTENT" } };

            var result = await repo.GetTradeBlotterAnalyticsAsync(request, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal(0m, GetProperty<decimal>(result, "TotalNotionalVolume"));
            Assert.Equal(0, GetProperty<int>(result, "TotalTradeCount"));
            Assert.Equal(0m, GetProperty<decimal>(result, "BuyNotionalVolume"));
            Assert.Equal(0m, GetProperty<decimal>(result, "SellNotionalVolume"));
        }

        [Fact]
        public async Task ExportTradeBlotterToStreamAsync_ReturnsValidReadableStream()
        {
            using var context = GetDbContext("Db_CsvExport_Pos");
            var repo = new TradeBlotterRepository(context, NullLogger<TradeBlotterRepository>.Instance);
            var request = new TradeBlotterRequestDto();

            using var stream = await repo.ExportTradeBlotterToStreamAsync(request, CancellationToken.None);

            Assert.NotNull(stream);
            Assert.True(stream.CanRead);

            using var reader = new StreamReader(stream);
            var csvText = await reader.ReadToEndAsync();
            Assert.Contains("Trade ID,Trade Date,Asset Class,Security,Trader,Side,Quantity,Price,Gross Notional", csvText);
            Assert.Contains("Apple Inc", csvText);
        }

        private class TestVantage7Context : Vantage7Context
        {
            public TestVantage7Context(DbContextOptions<Vantage7Context> options) : base(options) { }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<VwTradeBlotter>().HasKey(x => x.TradeId);
            }
        }
    }
}