using CASE_STUDY_7.Models;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CASE_STUDY_7.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecurityController : ControllerBase
    {
        private readonly ISecurityRepository _securityRepository;
        public SecurityController(ISecurityRepository securityRepository)
        {
            _securityRepository = securityRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetSecurities()
        {
            var securities = await _securityRepository.GetAllAsync();
            return Ok(securities);
        }

        [HttpGet("{securityId}")]
        public async Task<IActionResult> GetSecurityById(string securityId)
        {
            if (string.IsNullOrWhiteSpace(securityId))
            {
                return BadRequest("Security ID cannot be empty.");
            }
            var security = await _securityRepository.GetByIdAsync(securityId);

            if (security == null)
            {
                return NotFound($"Security with ID '{securityId}' was not found.");
            }

            return Ok(security);
        }


    }
}
