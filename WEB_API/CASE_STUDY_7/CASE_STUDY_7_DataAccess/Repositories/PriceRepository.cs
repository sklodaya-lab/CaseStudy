using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7_Models.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_DataAccess.Repositories
{
    public class PriceRepository : IPriceRepository
    {
        private readonly Vantage7Context _context;

        public PriceRepository(Vantage7Context context)
        {
            _context = context;
        }

        public async Task<decimal?> GetLatestPriceAsync(string securityId, DateOnly asOfDate)
        {
            // Retrieves the nearest preceding or exact match price on or before asOfDate
            var priceRecord = await _context.EodPrices.Where(p => p.SecurityId == securityId && p.PriceDate <= asOfDate)
                .OrderByDescending(p => p.PriceDate)
                .FirstOrDefaultAsync();

            return priceRecord?.ClosePrice;
        }

        public async Task<IReadOnlyDictionary<string, decimal>> GetLatestPricesForAllAsync(DateOnly asOfDate)
        {
            // Fetches the most recent closing price for ALL securities as of target date
            var asOfParam = new SqlParameter("@AsOfDate", asOfDate.ToDateTime(TimeOnly.MinValue));

            // Execute TVF direct query
            var prices = await _context.EodPrices
                .FromSqlRaw("SELECT SecurityID, PriceDate, ClosePrice, PriceId FROM g7.fn_GetEODPricesAsOf(@AsOfDate)", asOfParam)
                .AsNoTracking()
                .ToListAsync();

            return prices.ToDictionary(p => p.SecurityId, p => p.ClosePrice);
        }
    }
}
