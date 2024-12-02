using FluentResults;

namespace Extensions.FluentResult.Tests.Data
{
    public class Person(string Name)
    {
        public string Name { get; init; } = Name;
    }
    public class MiddleEarth
    {
        public string ActualAge { get; init; } = string.Empty;
        public IEnumerable<Person> People { get; init; } = [];
    }

    internal static class UnwrapData
    {
        public static string GetAge()
            => "First Age";

        public static IList<Person> GetPeople()
            => [new Person("Aragorn"), new Person("Gimli")];
    }
}
