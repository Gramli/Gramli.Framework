using System.Globalization;
using System.Reflection;
using System.Text;

namespace ReflectionBenchmark.GenericExport
{
    public static class GenericCsvExport
    {
        public static string ExportToCsv<T>(this IEnumerable<T> items, string separator = ";") where T : class
        {
            ArgumentNullException.ThrowIfNull(items);

            var properties = TypePropertiesCache<T>.Properties;
            var lastIndex = properties.Length - 1;

            var result = new StringBuilder();
            result.Append(string.Join(separator, TypePropertiesCache<T>.HeaderNames));
            result.AppendLine();

            foreach (var item in items)
            {
                for (var i = 0; i < properties.Length; i++)
                {
                    AppendValue(result, properties[i].GetValue(item));

                    if (i < lastIndex)
                        result.Append(separator);
                }
                result.AppendLine();
            }

            return result.ToString();
        }

        private static void AppendValue(StringBuilder sb, object? value)
        {
            if (value is string str)
                sb.Append(str);
            else if (value is IFormattable formattable)
                sb.Append(formattable.ToString(null, CultureInfo.InvariantCulture));
            else
                sb.Append(value);
        }

        private static class TypePropertiesCache<T> where T : class
        {
            public static readonly PropertyInfo[] Properties;
            public static readonly string[] HeaderNames;

            static TypePropertiesCache()
            {
                Properties = typeof(T).GetProperties();

                if (Properties.Length == 0)
                    throw new InvalidOperationException($"Type '{typeof(T).Name}' has no properties.");

                HeaderNames = new string[Properties.Length];
                for (var i = 0; i < Properties.Length; i++)
                {
                    var attr = Properties[i].GetCustomAttribute<CsvHeaderAttribute>()
                        ?? throw new InvalidOperationException(
                            $"Property '{Properties[i].Name}' is missing {nameof(CsvHeaderAttribute)}.");
                    HeaderNames[i] = attr.Header;
                }
            }
        }
    }
}
