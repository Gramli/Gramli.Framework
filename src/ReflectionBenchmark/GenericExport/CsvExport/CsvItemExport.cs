using System.Globalization;
using System.Text;

namespace ReflectionBenchmark.GenericExport.CsvExport
{
    public static class CsvItemExport
    {
        private const string DefaultHeaders =
            "Item1;Item2;Item3;Item4;Item5;Item6;Item7;Item8;Item9;Item10;Item11;Item12;Item13;Item14;Item15;Item16";

        public static string ExportToCsvFast(this IEnumerable<CustomItem> items, string separator = ";")
        {
            if (items is null)
            {
                throw new ArgumentNullException(nameof(items));
            }

            var result = new StringBuilder();

            result.AppendLine(separator == ";" ? DefaultHeaders : string.Join(separator,
                "Item1", "Item2", "Item3", "Item4", "Item5", "Item6", "Item7",
                "Item8", "Item9", "Item10", "Item11", "Item12", "Item13", "Item14", "Item15", "Item16"));

            foreach (var item in items)
            {
                result.AppendByProperty(item, separator);
            }

            return result.ToString();
        }

        private static void AppendByProperty(this StringBuilder sb, CustomItem item, string separator)
        {
            sb.Append(item.Item1).Append(separator);
            sb.Append(item.Item2).Append(separator);
            sb.Append(item.Item3.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item4.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item5.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item6.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item7).Append(separator);
            sb.Append(item.Item8).Append(separator);
            sb.Append(item.Item9).Append(separator);
            sb.Append(item.Item10.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item11.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item12.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item13.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item14).Append(separator);
            sb.Append(item.Item15.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item16);
            sb.AppendLine();
        }
    }
}
