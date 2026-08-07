using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_DataAccess.Repositories
{
    public class SecurityRepository : ISecurityRepository
    {
        private readonly Vantage7Context _context;

        public SecurityRepository(Vantage7Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Security>> GetAllAsync()
        {
            return await _context.Securities.AsNoTracking().OrderBy(s => s.SecurityName)
                .ToListAsync();
        }

        public async Task<Security> GetByIdAsync(string securityId)
        {
            var security = await _context.Securities.AsNoTracking()
                .FirstOrDefaultAsync(s => s.SecurityId == securityId);
            return security; 
        }
    }
}
