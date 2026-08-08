using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TradeBlotterController : ControllerBase
    {
        private readonly ITradeBlotterRepository _repository;

        public TradeBlotterController(ITradeBlotterRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetTradeBlotter(
            [FromQuery] TradeBlotterRequestDto request,
            [FromQuery] string? securityIdList,
            [FromQuery] string? traderIdList,
            CancellationToken cancellationToken)
        {
            request.SecurityIds = new List<string>();
            request.TraderIds = new List<int>();

            if (!string.IsNullOrWhiteSpace(securityIdList))
            {
                request.SecurityIds = securityIdList
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();
            }

            // Parse comma-separated trader string ("4,5") safely into List<int>
            if (!string.IsNullOrWhiteSpace(traderIdList))
            {
                request.TraderIds = traderIdList
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Select(s => int.TryParse(s, out int val) ? val : (int?)null)
                    .Where(val => val.HasValue)
                    .Select(val => val!.Value)
                    .ToList();
            }

            var result = await _repository.GetTradeBlotterAsync(request, cancellationToken);
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }
    }
}