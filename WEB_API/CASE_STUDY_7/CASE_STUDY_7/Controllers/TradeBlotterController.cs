using CASE_STUDY_7_Models.DTOs;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Http;
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
        public async Task<IActionResult> GetTradeBlotter( [FromQuery] TradeBlotterRequestDto request,CancellationToken cancellationToken)
        {
            var result = await _repository.GetTradeBlotterAsync(request, cancellationToken);
            if(result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }
    }
}
