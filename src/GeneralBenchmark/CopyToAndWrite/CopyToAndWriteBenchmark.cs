using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;

namespace GeneralBenchmark.CopyToAndWrite
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
    [MemoryDiagnoser]
    public class CopyToAndWriteBenchmark
    {
        public IEnumerable<CopyToAndWriteBenchmarkData> Data()
        {
            yield return new CopyToAndWriteBenchmarkData(1024 * 12);
            yield return new CopyToAndWriteBenchmarkData(1024 * 32);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 5);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 10);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 25);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 50);
        }


        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task MemoryStream_CopyTo_Async(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            using var innerStream = new MemoryStream(data.ByteData);
            await innerStream.CopyToAsync(outerStream);

        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task ByteArray_Write_Async(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            await outerStream.WriteAsync(data.ByteData);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void MemoryStream_CopyTo(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            using var innerStream = new MemoryStream(data.ByteData);
            innerStream.CopyTo(outerStream);

        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void ByteArray_Write(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            outerStream.Write(data.ByteData);
        }
    }
}
