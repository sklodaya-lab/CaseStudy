using CASE_STUDY_7_Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface IPnlCalculationService
    {
        Task<IEnumerable<PnlSummaryDto>> GetPnLSummaryAsync(DateTime asOfDate, string? securityId = null);
    }
}
