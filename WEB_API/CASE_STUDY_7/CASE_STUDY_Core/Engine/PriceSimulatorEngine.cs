using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_Core.Engine
{
    public class PriceSimulatorEngine
    {
        private static readonly Random _random = new Random();

        public static decimal GenerateNextPrice(decimal currentPrice, double annualizedVol = 0.20, double drift = 0.02)
        {
            // Time step for 1.5 second tick intervals (fraction of a 252-day trading year)
            double dt = 1.5 / (252.0 * 6.5 * 3600.0);

            // Box-Muller transform: converts uniform random numbers into normal distribution Z ~ N(0,1)
            double u1 = 1.0 - _random.NextDouble();
            double u2 = 1.0 - _random.NextDouble();
            double z = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);

            // Geometric Brownian Motion formula
            double currentDouble = (double)currentPrice;
            double expFactor = (drift - 0.5 * annualizedVol * annualizedVol) * dt + (annualizedVol * Math.Sqrt(dt) * z);
            double nextDouble = currentDouble * Math.Exp(expFactor);

            return Math.Round((decimal)nextDouble, 2);
        }
    }
}
