using CASE_STUDY_7_DataAccess.Reposiotires.TradeBlotteRepo;
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
            CancellationToken cancellationToken)
        {
 

            Console.WriteLine($"[DEBUG] SecurityIds count: {request?.SecurityIds?.Count ?? 0}");
            if (request?.SecurityIds != null)
            {
                foreach (var id in request.SecurityIds)
                {
                    Console.WriteLine($"[DEBUG] SecurityId Value: '{id}'");
                }
            }


            var result = await _repository.GetTradeBlotterAsync(request, cancellationToken);
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetTradeBlotterAnalytics(
                        [FromQuery] TradeBlotterRequestDto request,
                        CancellationToken cancellationToken)
        {
            var analyticsData = await _repository.GetTradeBlotterAnalyticsAsync(request, cancellationToken);
            return Ok(analyticsData);
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportTradeBlotter([FromQuery] TradeBlotterRequestDto request,CancellationToken cancellationToken)
        {
            var stream = await _repository.ExportTradeBlotterToStreamAsync(request, cancellationToken);
            var fileName = $"TradeBlotter_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

            return File(stream, "text/csv", fileName);
        }
    }
}