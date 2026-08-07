using CASE_STUDY_7_Models.Domain;
using CASE_STUDY_7_Models.Interfaces;
using CASE_STUDY_Core.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Test
{
    public class PnlCalculatorEngineTests
    {
        private readonly PnlCalculatorEngine _engine;

        public PnlCalculatorEngineTests()
        {
            _engine = new PnlCalculatorEngine();
        }

        [Fact]
        public void ProcessTrade_CaseStudyWorkedExample_CalculatesCorrectWacRealizedAndUnrealizedPnL()
        {
            // Arrange
            var state = new SecurityPositionState { SecurityId = "TEST_SEC" };

            // Step 1: Buy 100 @ ₹50
            _engine.ProcessTrade(state, "BUY", 100, 50.00m);
            Assert.Equal(100, state.NetQuantity);
            Assert.Equal(50.00m, state.WeightedAverageCost);
            Assert.Equal(0.00m, state.RealizedPnL);

            // Step 2: Buy 50 @ ₹55
            _engine.ProcessTrade(state, "BUY", 50, 55.00m);
            Assert.Equal(150, state.NetQuantity);
            Assert.Equal(51.666666666666666666666666667m, state.WeightedAverageCost, precision: 4);

            // Step 3: Sell 80 @ ₹60
            _engine.ProcessTrade(state, "SELL", 80, 60.00m);
            Assert.Equal(70, state.NetQuantity);
            Assert.Equal(51.666666666666666666666666667m, state.WeightedAverageCost, precision: 4);
            Assert.Equal(666.6666666666666666666666664m, state.RealizedPnL, precision: 2);

            // Mark-to-market at EOD ClosePrice = ₹58
            decimal unrealizedPnL = _engine.CalculateUnrealizedPnL(state, 58.00m);
            Assert.Equal(443.3333333333333333333333331m, unrealizedPnL, precision: 2);
        }

        [Fact]
        public void CalculateUnrealizedPnL_ZeroPosition_ReturnsZeroPnL()
        {
            var state = new SecurityPositionState { SecurityId = "TEST_SEC", NetQuantity = 0, WeightedAverageCost = 0m };
            decimal unrealizedPnL = _engine.CalculateUnrealizedPnL(state, 100.00m);
            Assert.Equal(0m, unrealizedPnL);
        }
    }
}
