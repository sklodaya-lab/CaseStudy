using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Models;
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
    public class TradeRepository : ITradeRepository
    {
        private readonly Vantage7Context _context;

        public TradeRepository(Vantage7Context context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Trade>> GetTradesUpToDateAsync(DateOnly asOfDate, string? securityId = null)
        {
            var fromDateParam = new SqlParameter("@FromDate", new DateTime(2026, 02, 02));
            var toDateParam = new SqlParameter("@ToDate", asOfDate.ToDateTime(TimeOnly.MinValue));
            var securityIdParam = new SqlParameter("@SecurityID", (object?)securityId ?? DBNull.Value);

            return await _context.Trades
                .FromSqlRaw("EXEC g7.sp_GetTradeLedgerForPnL @SecurityID, @FromDate, @ToDate",
                            securityIdParam, fromDateParam, toDateParam)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
