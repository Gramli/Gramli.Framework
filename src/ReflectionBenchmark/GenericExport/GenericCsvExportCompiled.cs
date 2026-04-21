using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace ReflectionBenchmark.GenericExport
{
    public static class GenericCsvExportCompiled
    {
        public static string ExportToCsvCompiled<T>(this IEnumerable<T> items, string separator = ";") where T : class
        {
            ArgumentNullException.ThrowIfNull(items);

            var getters = TypeMetadataCache<T>.Getters;
            var lastIndex = getters.Length - 1;

            var result = new StringBuilder();
            result.Append(separator == ";"
                ? TypeMetadataCache<T>.JoinedDefaultHeaders
                : string.Join(separator, TypeMetadataCache<T>.Headers));
            result.AppendLine();

            foreach (var item in items)
            {
                for (var i = 0; i < getters.Length; i++)
                {
                    result.Append(getters[i](item));

                    if (i < lastIndex)
                        result.Append(separator);
                }
                result.AppendLine();
            }

            return result.ToString();
        }

        private static class TypeMetadataCache<T> where T : class
        {
            public static readonly string[] Headers;
            public static readonly string JoinedDefaultHeaders;
            public static readonly Func<T, string>[] Getters;

            static TypeMetadataCache()
            {
                var properties = typeof(T).GetProperties();
                Headers = new string[properties.Length];
                Getters = new Func<T, string>[properties.Length];

                for (var i = 0; i < properties.Length; i++)
                {
                    var attr = properties[i].GetCustomAttribute<CsvHeaderAttribute>()
                        ?? throw new InvalidOperationException(
                            $"Property '{properties[i].Name}' on type '{typeof(T).Name}' is missing {nameof(CsvHeaderAttribute)}.");

                    Headers[i] = attr.Header;
                    Getters[i] = BuildGetter(properties[i]);
                }

                JoinedDefaultHeaders = string.Join(";", Headers);
            }

            private static Func<T, string> BuildGetter(PropertyInfo property)
            {
                var param = Expression.Parameter(typeof(T), "item");
                var propAccess = Expression.Property(param, property);
                var propType = property.PropertyType;

                Expression body;
                if (propType == typeof(string))
                {
                    body = propAccess;
                }
                else if (propType == typeof(float) || propType == typeof(double))
                {
                    body = Expression.Call(
                        propAccess,
                        propType.GetMethod(nameof(IFormattable.ToString), [typeof(string), typeof(IFormatProvider)])!,
                        Expression.Constant(null, typeof(string)),
                        Expression.Constant(CultureInfo.InvariantCulture, typeof(IFormatProvider)));
                }
                else
                {
                    body = Expression.Call(
                        Expression.Convert(propAccess, typeof(IFormattable)),
                        typeof(IFormattable).GetMethod(nameof(IFormattable.ToString))!,
                        Expression.Constant(null, typeof(string)),
                        Expression.Constant(CultureInfo.InvariantCulture));
                }

                return Expression.Lambda<Func<T, string>>(body, param).Compile();
            }
        }
    }
}
