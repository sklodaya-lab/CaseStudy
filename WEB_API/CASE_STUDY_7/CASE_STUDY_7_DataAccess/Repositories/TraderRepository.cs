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
    public class TraderRepository : ITraderRepository
    {
        private readonly Vantage7Context _context;

        public TraderRepository(Vantage7Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Trader>> GetAllAsync()
        {
            return await _context.Traders
                .AsNoTracking()
                .OrderBy(t => t.TraderName)
                .ToListAsync();
        }

        public async Task<Trader> GetByIdAsync(int traderId)
        {
            return await _context.Traders.AsNoTracking()
                .FirstOrDefaultAsync(t => t.TraderId == traderId);
        }
    }
}
