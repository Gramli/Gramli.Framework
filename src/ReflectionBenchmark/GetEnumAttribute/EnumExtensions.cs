using System.Collections.Concurrent;
using System.Reflection;

namespace ReflectionBenchmark.GetEnumAttribute
{
    public static class EnumExtensions
    {
        private static readonly ConcurrentDictionary<(Type EnumType, Type AttributeType, string MemberName), Attribute?> _cache = new();

        public static T? GetCustomAttributeCached<T>(this Enum customEnumValue) where T : Attribute
        {
            var enumType = customEnumValue.GetType();
            var key = (enumType, typeof(T), Enum.GetName(enumType, customEnumValue)!);
            return (T?)_cache.GetOrAdd(key, static k =>
                k.EnumType.GetField(k.MemberName)?.GetCustomAttribute(k.AttributeType));
        }

        public static T GetCustomAttribute<T>(this Enum customEnumValue) where T : Attribute
        {
            var enumType = customEnumValue.GetType();
            return enumType
                .GetField(Enum.GetName(enumType, customEnumValue)!)!
                .GetCustomAttribute<T>()!;
        }
    }
}
