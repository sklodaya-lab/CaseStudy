using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TraderController : ControllerBase
    {
        private readonly ITraderRepository _traderRepository;

        public TraderController(ITraderRepository traderRepository)
        {
            _traderRepository = traderRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetTraders()
        {
            var traders = await _traderRepository.GetAllAsync();
            return Ok(traders);
        }
        [HttpGet("{traderId:int}")]
        public async Task<IActionResult> GetTraderById(int traderId)
        {
            if (traderId <= 0)
            {
                return BadRequest("Trader ID must be a positive integer.");
            }

            var trader = await _traderRepository.GetByIdAsync(traderId);

            if (trader == null)
            {
                return NotFound($"Trader with ID '{traderId}' was not found.");
            }

            return Ok(trader);
        }
    }
}
