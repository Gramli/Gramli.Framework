using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;

namespace GeneralBenchmark.ExceptionsAndResult
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
    [MemoryDiagnoser]
    public class ExceptionAndResultBenchmark
    {
        private readonly ResultHandler _resultHandler;
        private readonly ThrowExceptionHandler _throwExceptionHandler;

        public IEnumerable<ExceptionAndResultBenchmarkData> Data()
        {
            yield return new ExceptionAndResultBenchmarkData(1000);
            yield return new ExceptionAndResultBenchmarkData(2500);
            yield return new ExceptionAndResultBenchmarkData(5000);
            yield return new ExceptionAndResultBenchmarkData(7500);
            //yield return new ExceptionAndResultBenchmarkData(10000);
        }

        public ExceptionAndResultBenchmark()
        {
            _resultHandler = new ResultHandler(Logger.Instance);
            _throwExceptionHandler = new ThrowExceptionHandler(Logger.Instance);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task Result_Pattern(ExceptionAndResultBenchmarkData data)
        {
            var _ = await _resultHandler.Handle(data.RequestData);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task Exception_Throw(ExceptionAndResultBenchmarkData data)
        {
            var _ = await _throwExceptionHandler.Handle(data.RequestData);
        }
    }
}
