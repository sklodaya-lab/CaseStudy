using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Domain
{
    public class SecurityPositionState
    {
        public string SecurityId { get; set; } = string.Empty;
        public int NetQuantity { get; set; } = 0;
        public decimal WeightedAverageCost { get; set; } = 0m;
        public decimal RealizedPnL { get; set; } = 0m;

        /// <summary>
        /// Creates a deep copy of the current state so mutation during forward-delta 
        /// calculations does not alter existing historical cached snapshots.
        /// </summary>
        public SecurityPositionState DeepClone()
        {
            return new SecurityPositionState
            {
                SecurityId = this.SecurityId,
                NetQuantity = this.NetQuantity,
                WeightedAverageCost = this.WeightedAverageCost,
                RealizedPnL = this.RealizedPnL
            };
        }
    }
}
