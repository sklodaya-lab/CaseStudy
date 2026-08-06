using CASE_STUDY_7_Models.Domain;
using CASE_STUDY_7_Models.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_Core.Engine
{
    public class PnlCalculatorEngine : IPnlCalculatorEngine
    {
        public void ProcessTrade(SecurityPositionState state, string buySell, int quantity, decimal price)
        {
            bool isBuy = buySell.Equals("BUY", StringComparison.OrdinalIgnoreCase);

            if (isBuy)
            {
                // Edge Case: If previous position was zero, reset baseline WAC directly to new trade price
                if (state.NetQuantity == 0)
                {
                    state.WeightedAverageCost = price;
                }
                else
                {
                    // WAC_new = [(Qty_current * WAC_current) + (Qty_buy * Price_buy)] / (Qty_current + Qty_buy)
                    decimal totalCost = (state.NetQuantity * state.WeightedAverageCost) + (quantity * price);
                    state.WeightedAverageCost = totalCost / (state.NetQuantity + quantity);
                }

                state.NetQuantity += quantity;
            }
            else // SELL
            {
                // Realized PnL = (Price_sell - WAC_at_sale) * Qty_sell
                decimal tradeRealizedPnL = (price - state.WeightedAverageCost) * quantity;
                state.RealizedPnL += tradeRealizedPnL;

                state.NetQuantity -= quantity;

                // Selling reduces position size but leaves WAC unchanged
                // Edge Case: If net position drops to zero, reset WAC to 0
                if (state.NetQuantity == 0)
                {
                    state.WeightedAverageCost = 0m;
                }
            }
        }
        public decimal CalculateUnrealizedPnL(SecurityPositionState state, decimal closePrice)
        {
            // Reset/Return 0 if position is zero
            if (state.NetQuantity == 0)
            {
                return 0m;
            }

            // Unrealized PnL = (Price_EOD - WAC) * Net Position
            return (closePrice - state.WeightedAverageCost) * state.NetQuantity;
        }
    }
}
