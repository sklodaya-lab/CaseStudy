using System;
using System.Collections.Generic;

namespace CASE_STUDY_7.Models;

public partial class VwTradeBlotter
{
    public DateOnly TradeDate { get; set; }

    public string SecurityId { get; set; } = null!;

    public int TradeId { get; set; }

    public string BuySell { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public int TraderId { get; set; }

    public string TraderName { get; set; } = null!;

    public string SecurityName { get; set; } = null!;

    public decimal? GrossNotionalAmount { get; set; }
}
