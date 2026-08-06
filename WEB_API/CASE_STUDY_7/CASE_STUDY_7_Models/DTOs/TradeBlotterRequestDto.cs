using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_Models.DTOs
{
    public class TradeBlotterRequestDto
    {
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }

        private int pageNumber = 1;
        private int pageSize = 50;

        public int PageNumber
        {
            get => pageNumber;
            set => pageNumber = value <= 0 ? 1 : value;
        }

        public int PageSize
        {
            get => pageSize;
            set => pageSize = value <= 0 ? 50 : (value > 500 ? 500 : value);
        }
    }
}
