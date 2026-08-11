using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.DTOs
{
    public class TradeBlotterPagedResultDto
    {
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public List<TradeBlotterItemDto> Items { get; set; } = new();
    }
}
