using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.DTOs
{
    public class PnlTimeSeriesDTO
    {
        public DateOnly ValuationDate { get; set; }
        public string SecurityId { get; set; } = string.Empty;

        public int NetPosition { get; set; }
        public decimal WeightedAverageCost { get; set; }
        public decimal ClosingPrice { get; set; }

        public decimal RealizedPnL { get; set; }
        public decimal MtmUnrealizedPnL { get; set; }
        public decimal TotalPnL => RealizedPnL + MtmUnrealizedPnL;
    }
}
