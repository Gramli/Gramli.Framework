using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;
using ReflectionBenchmark.GenericExport.CsvExport;

namespace ReflectionBenchmark.GenericExport
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
    [MemoryDiagnoser]
    public class GenericExportBenchmark
    {
        public IEnumerable<GenericExportBenchmarkData> Data()
        {
            yield return new GenericExportBenchmarkData(10);
            yield return new GenericExportBenchmarkData(100);
            yield return new GenericExportBenchmarkData(1000);
            yield return new GenericExportBenchmarkData(5000);
            yield return new GenericExportBenchmarkData(10000);
            //yield return new GenericExportBenchmarkData(25000);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomSmallItem(GenericExportBenchmarkData data)
        {
            var _ = data.SmallItems.ExportToCsv();
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomItem(GenericExportBenchmarkData data)
        {

            var _ = data.Items.ExportToCsv();
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomLargeItem(GenericExportBenchmarkData data)
        {
            var _ = data.LargeItems.ExportToCsv();
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomSmallItemFast(GenericExportBenchmarkData data)
        {
            var _ = data.SmallItems.ExportToCsvFast();
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomItemFast(GenericExportBenchmarkData data)
        {

            var _ = data.Items.ExportToCsvFast();
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void CustomLargeItemFast(GenericExportBenchmarkData data)
        {
            var _ = data.LargeItems.ExportToCsvFast();
        }
    }
}
