using CASE_STUDY_7.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface ITraderRepository
    {
        Task<IEnumerable<Trader>> GetAllAsync();
        Task<Trader> GetByIdAsync(int traderId);
    }
}
