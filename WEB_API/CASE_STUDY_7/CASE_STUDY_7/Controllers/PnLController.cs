using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.ModelBinders;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PnLController : ControllerBase
    {
        private readonly IPnlCalculationService _pnlService;
        private readonly ILogger<PnLController> _logger;

        public PnLController(IPnlCalculationService pnlService, ILogger<PnLController> logger)
        {
            _pnlService = pnlService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/PnL/summary?asOfDate=2026-03-31&securityId=SEC1
        /// Returns Realized PnL, Unrealized MTM PnL, Net Positions, and WAC.
        /// Defaults to case study benchmark date: 2026-03-31 if omitted.
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetPnLSummary(
            [FromQuery] DateOnly? asOfDate,
            [ModelBinder(BinderType = typeof(IdListBinder))] List<string>? securityId)
        {
            try
            {
                // Default to end-of-period benchmark date specified in case study
                var targetDate = asOfDate ?? new DateOnly(2026, 03, 31);

                var summaryResults = await _pnlService.GetPnLSummaryAsync(targetDate, securityId);
                return Ok(summaryResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching PnL summary as of date {TargetDate}", asOfDate);
                return StatusCode(500, new { message = "An error occurred while computing PnL summary." });
            }
        }

        /// <summary>
        /// GET /api/PnL/timeseries?securityId=SEC1&asOfDate=2026-03-31
        /// Returns daily historical PnL time series metrics for a specific security.
        /// </summary>
        [HttpGet("timeseries")]
        public async Task<IActionResult> GetPnlTimeSeries([FromQuery] string securityId, [FromQuery] DateOnly? asOfDate)
        {
            if (string.IsNullOrWhiteSpace(securityId))
            {
                return BadRequest(new { message = "Parameter 'securityId' is required." });
            }

            try
            {
                var results = await _pnlService.GetPnlTimeSeriesAsync(securityId, asOfDate);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching PnL time series for SecurityId: {SecurityId}", securityId);
                return StatusCode(500, new { message = "An error occurred while generating PnL time series." });
            }
        }
    }
}