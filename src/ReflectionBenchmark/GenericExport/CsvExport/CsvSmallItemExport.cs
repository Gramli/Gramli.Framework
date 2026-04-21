using System.Globalization;
using System.Text;

namespace ReflectionBenchmark.GenericExport.CsvExport
{
    public static class CsvSmallItemExport
    {
        private const string DefaultHeaders =
            "Item1;Item2;Item3;Item4;Item5;Item6;Item7";

        public static string ExportToCsvFast(this IEnumerable<CustomSmallItem> items, string separator = ";")
        {
            if (items is null)
            {
                throw new ArgumentNullException(nameof(items));
            }

            var result = new StringBuilder();

            result.AppendLine(separator == ";" ? DefaultHeaders : string.Join(separator,
                "Item1", "Item2", "Item3", "Item4", "Item5", "Item6", "Item7"));

            foreach (var item in items)
            {
                result.AppendByProperty(item, separator);
            }

            return result.ToString();
        }

        private static void AppendByProperty(this StringBuilder sb, CustomSmallItem item, string separator)
        {
            sb.Append(item.Item1).Append(separator);
            sb.Append(item.Item2).Append(separator);
            sb.Append(item.Item3.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item4.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item5.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item6.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item7);
            sb.AppendLine();
        }
    }
}
