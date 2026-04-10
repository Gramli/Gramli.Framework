using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;

namespace ReflectionBenchmark.GetEnumAttribute
{
    [SimpleJob(RuntimeMoniker.Net10_0)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.FastestToSlowest)]
    [MemoryDiagnoser]
    public class GetEnumAttributeBenchmark
    {
        [Params(1,100,1000,5000)]
        public int Count;

        private CustomEnum[] _values = [];
        private CustomSmallEnum[] _smallValues = [];
        private CustomLargeEnum[] _largeValues = [];


       [GlobalSetup]
        public void Setup()
        {

            var rnd = new Random(42);

            var all = Enum.GetValues<CustomEnum>();
            var smallAll = Enum.GetValues<CustomSmallEnum>();
            var largeAll = Enum.GetValues<CustomLargeEnum>();

            _values = [.. Enumerable
                .Range(0, Count)
                .Select(_ => all[rnd.Next(all.Length)])];

            _smallValues = [.. Enumerable
                .Range(0, Count)
                .Select(_ => smallAll[rnd.Next(smallAll.Length)])];

            _largeValues = [.. Enumerable
                .Range(0, Count)
                .Select(_ => largeAll[rnd.Next(largeAll.Length)])];
        }

        [Benchmark(Baseline = true)]
        public void CustomEnum()
        {
            for (var i = 0; i < _values.Length; i++)
            {
                _ = _values[i].GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomLargeEnum()
        {
            for (var i = 0; i < _largeValues.Length; i++)
            {
                _ = _largeValues[i].GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomSmallEnum()
        {
            for (var i = 0; i < _smallValues.Length; i++)
            {
                _ = _smallValues[i].GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomEnumMap()
        {
            for (var i = 0; i < _values.Length; i++)
            {
                _ = CustomEnumDescriptionMap.Map[_values[i]];
            }
        }

        [Benchmark]
        public void CustomLargeEnumMap()
        {
            for (var i = 0; i < _largeValues.Length; i++)
            {
                _ = CustomEnumDescriptionMap.LargeMap[_largeValues[i]];
            }
        }

        [Benchmark]
        public void CustomSmallEnumMap()
        {
            for (var i = 0; i < _smallValues.Length; i++)
            {
                _ = CustomEnumDescriptionMap.SmallMap[_smallValues[i]];
            }
        }

        [Benchmark]
        public void CustomEnumCached()
        {
            for (var i = 0; i < _values.Length; i++)
            {
                _ = _values[i].GetCustomAttributeCached<CustomEnumAttribute>()!.Description;
            }
        }

        [Benchmark]
        public void CustomLargeEnumCached()
        {
            for (var i = 0; i < _largeValues.Length; i++)
            {
                _ = _largeValues[i].GetCustomAttributeCached<CustomEnumAttribute>()!.Description;
            }
        }

        [Benchmark]
        public void CustomSmallEnumCached()
        {
            for (var i = 0; i < _smallValues.Length; i++)
            {
                _ = _smallValues[i].GetCustomAttributeCached<CustomEnumAttribute>()!.Description;
            }
        }

        [Benchmark]
        public void CustomEnumFrozenMap()
        {
            for (var i = 0; i < _values.Length; i++)
            {
                _ = CustomEnumDescriptionMap.FrozenMap[_values[i]];
            }
        }

        [Benchmark]
        public void CustomLargeEnumFrozenMap()
        {
            for (var i = 0; i < _largeValues.Length; i++)
            {
                _ = CustomEnumDescriptionMap.FrozenLargeMap[_largeValues[i]];
            }
        }

        [Benchmark]
        public void CustomSmallEnumFrozenMap()
        {
            for (var i = 0; i < _smallValues.Length; i++)
            {
                _ = CustomEnumDescriptionMap.FrozenSmallMap[_smallValues[i]];
            }
        }

        // TODO: SourceGenerator benchmark
        // 1. Create a new project (e.g. EnumDescriptionGenerator) targeting netstandard2.0
        // 2. Add <PackageReference Include="Microsoft.CodeAnalysis.CSharp" Version="..." />
        //    and mark it as an analyzer: <PackageReference ... OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
        // 3. In the generator, find all enum types decorated with a marker attribute (e.g. [GenerateDescription])
        // 4. For each such enum, emit a partial class with a static FrozenDictionary<TEnum, string>
        //    auto-populated from the [CustomEnumAttribute] values — zero runtime reflection, zero manual maintenance
        // 5. Add a benchmark method here that reads from the generated dictionary
        //    to show it matches FrozenDictionary speed while requiring no manual dictionary upkeep
    }
}
