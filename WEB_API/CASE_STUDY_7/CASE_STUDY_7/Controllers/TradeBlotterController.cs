using CASE_STUDY_7_DataAccess.Reposiotires.TradeBlotteRepo;
using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TradeBlotterController : ControllerBase
    {
        private readonly ITradeBlotterRepository _repository;
        private readonly ILogger<TradeBlotterController> _logger;

        public TradeBlotterController(
            ITradeBlotterRepository repository,
            ILogger<TradeBlotterController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTradeBlotter([FromQuery] TradeBlotterRequestDto request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _repository.GetTradeBlotterAsync(request, cancellationToken);
                if (result == null)
                {
                    return NotFound(new { message = "No trade blotter data found." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching Trade Blotter data");
                return StatusCode(500, new { message = "An error occurred while fetching trade blotter data." });
            }
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetTradeBlotterAnalytics([FromQuery] TradeBlotterRequestDto request, CancellationToken cancellationToken)
        {
            try
            {
                var analyticsData = await _repository.GetTradeBlotterAnalyticsAsync(request, cancellationToken);
                return Ok(analyticsData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching Trade Blotter Analytics");
                return StatusCode(500, new { message = "An error occurred while calculating analytics." });
            }
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportTradeBlotter([FromQuery] TradeBlotterRequestDto request, CancellationToken cancellationToken)
        {
            try
            {
                var stream = await _repository.ExportTradeBlotterToStreamAsync(request, cancellationToken);
                var fileName = $"TradeBlotter_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

                return File(stream, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting Trade Blotter CSV");
                return StatusCode(500, new { message = "An error occurred while exporting data." });
            }
        }
    }
}