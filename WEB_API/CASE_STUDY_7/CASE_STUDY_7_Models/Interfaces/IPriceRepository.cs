using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface IPriceRepository
    {
        Task<decimal?> GetLatestPriceAsync(string securityId, DateOnly asOfDate);
        Task<IReadOnlyDictionary<string, decimal>> GetLatestPricesForAllAsync(DateOnly asOfDate);
    }
}
