using System.Globalization;
using System.Text;

namespace ReflectionBenchmark.GenericExport.CsvExport
{
    public static class CsvLargeItemExport
    {
        private const string DefaultHeaders =
            "Item1;Item2;Item3;Item4;Item5;Item6;Item7;Item8;Item9;Item10;Item11;Item12;Item13;Item14;Item15;Item16;" +
            "Item17;Item18;Item19;Item20;Item21;Item22;Item23;Item24;Item25;Item26;Item27;Item28;Item29;Item30;Item31;Item32";

        public static string ExportToCsvFast(this IEnumerable<CustomLargeItem> items, string separator = ";")
        {
            if (items is null)
            {
                throw new ArgumentNullException(nameof(items));
            }

            var result = new StringBuilder();

            result.AppendLine(separator == ";" ? DefaultHeaders : string.Join(separator,
                "Item1", "Item2", "Item3", "Item4", "Item5", "Item6", "Item7",
                "Item8", "Item9", "Item10", "Item11", "Item12", "Item13", "Item14", "Item15", "Item16",
                "Item17", "Item18", "Item19", "Item20", "Item21", "Item22", "Item23",
                "Item24", "Item25", "Item26", "Item27", "Item28", "Item29", "Item30", "Item31", "Item32"));

            foreach (var item in items)
            {
                result.AppendByProperty(item, separator);
            }

            return result.ToString();
        }

        private static void AppendByProperty(this StringBuilder sb, CustomLargeItem item, string separator)
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
            sb.Append(item.Item16).Append(separator);
            sb.Append(item.Item17).Append(separator);
            sb.Append(item.Item18).Append(separator);
            sb.Append(item.Item19.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item20.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item21.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item22.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item23).Append(separator);
            sb.Append(item.Item24).Append(separator);
            sb.Append(item.Item25).Append(separator);
            sb.Append(item.Item26.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item27.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item28.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item29.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item30).Append(separator);
            sb.Append(item.Item31.ToString(null, CultureInfo.InvariantCulture)).Append(separator);
            sb.Append(item.Item32);
            sb.AppendLine();
        }
    }
}
