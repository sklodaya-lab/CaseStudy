using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PnLController : ControllerBase
    {
        private readonly IPnlCalculationService _pnlService;

        public PnLController(IPnlCalculationService pnlService)
        {
            _pnlService = pnlService;
        }

        /// <summary>
        /// GET /api/v1/pnl/summary?asOfDate=2026-03-31&securityId=SEC1
        /// Returns Realized PnL, Unrealized MTM PnL, Net Positions, and WAC.
        /// Defaults to case study benchmark date: 2026-03-31 if omitted.
        /// </summary>
        /// 

        
        [HttpGet("summary")]
        public async Task<IActionResult> GetPnLSummary(
            [FromQuery] DateOnly? asOfDate,
            [FromQuery] string? securityId)
        {
            // Default to end-of-period benchmark date specified in case study
            var targetDate = asOfDate ?? new DateOnly(2026, 03, 31);

            var summaryResults = await _pnlService.GetPnLSummaryAsync(targetDate, securityId);
            return Ok(summaryResults);
        }
    }
}
