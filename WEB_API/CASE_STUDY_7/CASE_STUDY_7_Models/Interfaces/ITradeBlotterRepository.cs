using CASE_STUDY_7_Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface ITradeBlotterRepository
    {
        public Task<TradeBlotterPagedResultDto> GetTradeBlotterAsync(TradeBlotterRequestDto request, CancellationToken cancellationToken = default);
    }
}
