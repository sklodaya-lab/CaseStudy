using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CASE_STUDY_7_DataAccess.Services
{
    public static class CsvExportService
    {
        public static MemoryStream BuildCsvStream<T>(
            string headerRow,
            IEnumerable<T> items,
            Func<T, string> rowFormatter)
        {
            var stream = new MemoryStream();
            using (var writer = new StreamWriter(stream, Encoding.UTF8, leaveOpen: true))
            {
                writer.WriteLine(headerRow);

                foreach (var item in items)
                {
                    writer.WriteLine(rowFormatter(item));
                }

                writer.Flush();
            }

            stream.Position = 0;
            return stream;
        }
    }
}

