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
        Task<IEnumerable<PnlSummaryDto>> GetPnLSummaryAsync(DateOnly asOfDate, IEnumerable<string>? securityId = null);

        Task<IEnumerable<PnlTimeSeriesDTO>> GetPnlTimeSeriesAsync(string securityId, DateOnly? asOfDate = null);
    }
}
