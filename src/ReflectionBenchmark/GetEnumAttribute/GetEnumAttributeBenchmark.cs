using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;

namespace ReflectionBenchmark.GetEnumAttribute
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.FastestToSlowest)]
    [MemoryDiagnoser]
    public class GetEnumAttributeBenchmark
    {
        [Params(1,100,1000,5000,10000,25000)]
        public int Count;

        private CustomSmallEnum _smallEnumValue;
        private CustomEnum _enumValue;
        private CustomLargeEnum _largeEnumValue;


       [GlobalSetup]
        public void Setup()
        {
            _smallEnumValue = (CustomSmallEnum)new Random(42).Next(0, Enum.GetValues(typeof(CustomSmallEnum)).Length - 1);
            _enumValue = (CustomEnum)new Random(42).Next(0,Enum.GetValues(typeof(CustomEnum)).Length -1);
            _largeEnumValue = (CustomLargeEnum)new Random(42).Next(0, Enum.GetValues(typeof(CustomLargeEnum)).Length - 1);
        }

        [Benchmark(Baseline = true)]
        public void CustomEnum()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = _enumValue.GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomLargeEnum()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = _largeEnumValue.GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomSmallEnum()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = _smallEnumValue.GetCustomAttribute<CustomEnumAttribute>().Description;
            }
        }

        [Benchmark]
        public void CustomEnumMap()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = CustomEnumDescriptionMap.Map[_enumValue];
            }
        }

        [Benchmark]
        public void CustomLargeEnumMap()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = CustomEnumDescriptionMap.LargeMap[_largeEnumValue];
            }
        }

        [Benchmark]
        public void CustomSmallEnumMap()
        {
            for (var i = 0; i < Count; i++)
            {
                _ = CustomEnumDescriptionMap.SmallMap[_smallEnumValue];
            }
        }
    }
}
