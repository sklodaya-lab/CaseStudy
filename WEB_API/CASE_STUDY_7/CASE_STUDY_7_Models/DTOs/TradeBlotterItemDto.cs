using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.DTOs
{
    public class TradeBlotterItemDto
    {
        public int TradeId { get; set; }
        public DateOnly TradeDate { get; set; }
        public string SecurityId { get; set; } = string.Empty;
        public string SecurityName { get; set; } = string.Empty;
        public int TraderId { get; set; }
        public string TraderName { get; set; } = string.Empty;
        public string BuySell { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal GrossNotionalAmount { get; set; }
    }
}
