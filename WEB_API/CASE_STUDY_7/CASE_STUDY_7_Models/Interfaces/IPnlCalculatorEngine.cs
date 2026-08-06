using CASE_STUDY_7_Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.Interfaces
{
    public interface IPnlCalculatorEngine
    {
        public void ProcessTrade(SecurityPositionState state, string buySell, int quantity, decimal price);

        public decimal CalculateUnrealizedPnL(SecurityPositionState state, decimal closePrice);
    }
}
