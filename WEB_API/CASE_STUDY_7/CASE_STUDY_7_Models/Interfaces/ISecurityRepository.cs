using CASE_STUDY_7.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface ISecurityRepository
    {
        Task<IEnumerable<Security>> GetAllAsync();
        Task<Security> GetByIdAsync(string securityId);
    }
}
