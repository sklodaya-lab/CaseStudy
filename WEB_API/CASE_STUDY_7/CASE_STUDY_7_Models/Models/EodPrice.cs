using System;
using System.Collections.Generic;

namespace CASE_STUDY_7.Models;

public partial class EodPrice
{
    public int PriceId { get; set; }

    public string SecurityId { get; set; } = null!;

    public DateOnly PriceDate { get; set; }

    public decimal ClosePrice { get; set; }

    public virtual Security Security { get; set; } = null!;
}
