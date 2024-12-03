using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace ReflectionBenchmark.CreateClassInstance
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.FastestToSlowest)]
    [MemoryDiagnoser]
    public class CreateClassInstanceBenchmark
    {
        private readonly IServiceProvider _serviceProvider;
        public CreateClassInstanceBenchmark()
        {
            _serviceProvider = new ServiceCollection()
                .AddTransient<ISomeJob>((_) => new SomeJob(10))
                .BuildServiceProvider();
        }


        [Benchmark]
        public void ActivatorCreateInstance_Interface()
        {
            var interfaceType = typeof(ISomeJob);
            var instanceType = Assembly.GetExecutingAssembly().GetTypeByInterfaceSingle(interfaceType);
            var _ = Activator.CreateInstance(instanceType, 15) as ISomeJob;
        }

        [Benchmark]
        public void ActivatorCreateInstance_Concrete()
        {
            var instanceType = typeof(SomeJob);
            var _ = Activator.CreateInstance(instanceType, 15) as ISomeJob;
        }

        [Benchmark(Baseline = true)]
        public void CreateInstance()
        {
            var _ = _serviceProvider.GetService<ISomeJob>();
        }
    }
}
