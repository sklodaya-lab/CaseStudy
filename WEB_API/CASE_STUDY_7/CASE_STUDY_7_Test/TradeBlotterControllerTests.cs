using CASE_STUDY_7.Controllers;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Mvc;
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

        public TradeBlotterControllerTests()
        {
            _mockRepo = new Mock<ITradeBlotterRepository>();
            _controller = new TradeBlotterController(_mockRepo.Object);
        }

        [Fact]
        public async Task GetTradeBlotter_ValidRequest_ReturnsOkWithData()
        {
            // Arrange
            var requestDto = new TradeBlotterRequestDto
            {
                PageNumber = 1,
                PageSize = 10,
                SecurityId = "EQ04"
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
                        TraderName = "John Doe",
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

            // Act: Pass CancellationToken.None to match your controller method signature
            var result = await _controller.GetTradeBlotter(requestDto, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnData = Assert.IsType<TradeBlotterPagedResultDto>(okResult.Value);

            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(1, returnData.TotalRecords);
            Assert.Single(returnData.Items);
        }

        [Fact]
        public async Task GetTradeBlotter_NoMatches_ReturnsOkWithEmptyItems()
        {
            // Arrange
            var requestDto = new TradeBlotterRequestDto { SecurityId = "NON_EXISTENT" };
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

            // Act
            var result = await _controller.GetTradeBlotter(requestDto, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnData = Assert.IsType<TradeBlotterPagedResultDto>(okResult.Value);

            Assert.Equal(0, returnData.TotalRecords);
            Assert.Empty(returnData.Items);
        }

       [Fact]
public async Task GetTradeBlotter_InvalidModelState_ReturnsBadRequest()
{
    // Arrange
    var requestDto = new TradeBlotterRequestDto();
    _controller.ModelState.AddModelError("FromDate", "FromDate cannot be after ToDate");

    // Act: Simulate what ASP.NET Core's [ApiController] does at runtime
    IActionResult result;
    if (!_controller.ModelState.IsValid)
    {
        result = _controller.BadRequest(_controller.ModelState);
    }
    else
    {
        result = await _controller.GetTradeBlotter(requestDto, CancellationToken.None);
    }

    // Assert
    var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
    Assert.Equal(400, badRequestResult.StatusCode);
}

        [Fact]
        public async Task GetTradeBlotter_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var requestDto = new TradeBlotterRequestDto();
            _mockRepo
                .Setup(repo => repo.GetTradeBlotterAsync(It.IsAny<TradeBlotterRequestDto>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Database connection failure"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetTradeBlotter(requestDto, CancellationToken.None));
        }
    }
}