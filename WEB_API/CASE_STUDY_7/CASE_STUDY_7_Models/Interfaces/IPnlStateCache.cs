using CASE_STUDY_7_Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface IPnlStateCache
    {
        Task<SecurityPositionState> GetPositionStateAsync(string securityId, DateOnly asOfDate);
        
        IReadOnlyList<(DateOnly Date, SecurityPositionState State)> GetHistoryFromCache(string securityId, DateOnly maxDate);
    }
}
