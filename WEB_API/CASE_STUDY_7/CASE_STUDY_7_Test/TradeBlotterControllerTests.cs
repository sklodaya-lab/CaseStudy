using CASE_STUDY_7.Controllers;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace CASE_STUDY_7_Test
{
    public class TradeBlotterControllerTests
    {
        private readonly Mock<ITradeBlotterRepository> _mockRepo;
        private readonly TradeBlotterController _controller;
        private readonly Mock<ILogger<TradeBlotterController>> _mockLogger;

        public TradeBlotterControllerTests()
        {
            _mockRepo = new Mock<ITradeBlotterRepository>();
            _mockLogger = new Mock<ILogger<TradeBlotterController>>();
            _controller = new TradeBlotterController(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetTradeBlotter_ValidRequest_ReturnsOkWithData()
        {
            // Arrange
            var requestDto = new TradeBlotterRequestDto
            {
                PageNumber = 1,
                PageSize = 10,
                SecurityIds = ["EQ04"]
            };

            var expectedResult = new TradeBlotterPagedResultDto
            {
                TotalRecords = 1,
                PageNumber = 1,
                PageSize = 10,
                Items = new List<TradeBlotterItemDto>
                {
                    new TradeBlotterItemDto
                    {
                        TradeId = 1,
                        TradeDate = new DateOnly(2026, 1, 15),
                        SecurityId = "EQ04",
                        SecurityName = "Apple Inc",
                        TraderId = 5,
                        TraderName = "Raghav Singh",
                        BuySell = "BUY",
                        Quantity = 100,
                        Price = 150.00m,
                        GrossNotionalAmount = 15000.00m
                    }
                }
            };

            _mockRepo
                .Setup(repo => repo.GetTradeBlotterAsync(It.IsAny<TradeBlotterRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedResult);

            var result = await _controller.GetTradeBlotter(requestDto, CancellationToken.None);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnData = Assert.IsType<TradeBlotterPagedResultDto>(okResult.Value);

            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(1, returnData.TotalRecords);
            Assert.Single(returnData.Items);
        }

        [Fact]
        public async Task GetTradeBlotter_NoMatches_ReturnsOkWithEmptyItems()
        {
            var requestDto = new TradeBlotterRequestDto { SecurityIds = ["NON_EXISTENT"] };
            var emptyResult = new TradeBlotterPagedResultDto
            {
                TotalRecords = 0,
                PageNumber = 1,
                PageSize = 10,
                Items = new List<TradeBlotterItemDto>()
            };

            _mockRepo
                .Setup(repo => repo.GetTradeBlotterAsync(It.IsAny<TradeBlotterRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(emptyResult);

            var result = await _controller.GetTradeBlotter(requestDto, CancellationToken.None);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnData = Assert.IsType<TradeBlotterPagedResultDto>(okResult.Value);

            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(0, returnData.TotalRecords);
            Assert.Empty(returnData.Items);
        }

        [Fact]
        public async Task GetTradeBlotter_NullRequestDto_HandlesGracefullyAndReturnsAllTrades()
        {
            var allTradesResult = new TradeBlotterPagedResultDto
            {
                TotalRecords = 2,
                PageNumber = 1,
                PageSize = 10,
                Items = new List<TradeBlotterItemDto>
        {
            new TradeBlotterItemDto { TradeId = 1, SecurityId = "EQ04", Price = 150.00m },
            new TradeBlotterItemDto { TradeId = 2, SecurityId = "FI01", Price = 98.50m }
        }
            };

            _mockRepo
                .Setup(repo => repo.GetTradeBlotterAsync(It.IsAny<TradeBlotterRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(allTradesResult);


            var result = await _controller.GetTradeBlotter(null, CancellationToken.None);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnData = Assert.IsType<TradeBlotterPagedResultDto>(okResult.Value);

            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(2, returnData.TotalRecords); 
            Assert.Equal(2, returnData.Items.Count);
        }

        [Fact]
        public async Task ExportTradesCsv_ValidRequest_ReturnsFileResultWithCsvMimeType()
        {
 
            var requestDto = new TradeBlotterRequestDto { SecurityIds = ["EQ04"] };

            var fakeCsvBytes = System.Text.Encoding.UTF8.GetBytes("TradeId,SecurityId,Price\n1,EQ04,150.00");

            var fakeCsvStream = new MemoryStream(fakeCsvBytes);

            _mockRepo
                .Setup(repo => repo.ExportTradeBlotterToStreamAsync(It.IsAny<TradeBlotterRequestDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(fakeCsvStream); 

            var result = await _controller.ExportTradeBlotter(requestDto, CancellationToken.None);

            var fileResult = Assert.IsType<FileStreamResult>(result);

            Assert.Equal("text/csv", fileResult.ContentType);
            Assert.NotNull(fileResult.FileDownloadName);

            _mockRepo.Verify(repo => repo.ExportTradeBlotterToStreamAsync(requestDto, CancellationToken.None), Times.Once);
        }

    }
}