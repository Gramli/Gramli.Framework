namespace Extensions.FluentResult.Tests.Data
{
    public class Person(string name) { public string Name { get; init; } = name; }
    public class King(string name, string country): Person(name) { public string Country { get; init; } = country; }

    public class MiddleEarth
    {
        public string ActualAge { get; init; } = string.Empty;
        public IEnumerable<Person> People { get; init; } = [];
        public IEnumerable<King>? Kings {  get; init; }
    }

    internal static class UnwrapData
    {
        public static string GetAge()
            => "First Age";

        public static IList<Person> GetPeople()
            => [new Person("Aragorn"), new Person("Gimli")];
    }
}
