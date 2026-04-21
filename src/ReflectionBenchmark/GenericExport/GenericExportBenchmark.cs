using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using ReflectionBenchmark.GenericExport.CsvExport;

namespace ReflectionBenchmark.GenericExport
{
    [SimpleJob(RuntimeMoniker.Net10_0)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
    [MemoryDiagnoser]
    public class GenericExportBenchmark
    {
        public IEnumerable<GenericExportBenchmarkData> Data()
        {
            yield return new GenericExportBenchmarkData(100);
            yield return new GenericExportBenchmarkData(500);
            yield return new GenericExportBenchmarkData(1000);
            yield return new GenericExportBenchmarkData(5000);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomSmallItem(GenericExportBenchmarkData data)
            => data.SmallItems.ExportToCsv();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomItem(GenericExportBenchmarkData data)
            => data.Items.ExportToCsv();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomLargeItem(GenericExportBenchmarkData data)
            => data.LargeItems.ExportToCsv();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomSmallItemCompiled(GenericExportBenchmarkData data)
            => data.SmallItems.ExportToCsvCompiled();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomItemCompiled(GenericExportBenchmarkData data)
            => data.Items.ExportToCsvCompiled();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomLargeItemCompiled(GenericExportBenchmarkData data)
            => data.LargeItems.ExportToCsvCompiled();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomSmallItemFast(GenericExportBenchmarkData data)
            => data.SmallItems.ExportToCsvFast();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomItemFast(GenericExportBenchmarkData data)
            => data.Items.ExportToCsvFast();

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public string CustomLargeItemFast(GenericExportBenchmarkData data)
            => data.LargeItems.ExportToCsvFast();
    }
}
