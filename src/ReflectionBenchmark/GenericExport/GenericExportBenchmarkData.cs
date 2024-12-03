using Bogus;

namespace ReflectionBenchmark.GenericExport
{
    public class GenericExportBenchmarkData
    {
        public IList<CustomLargeItem> LargeItems { get; }
        public IList<CustomItem> Items { get; }
        public IList<CustomSmallItem> SmallItems { get; }

        private readonly int _count;

        public GenericExportBenchmarkData(int count)
        {
            _count = count;
            LargeItems = [];
            Items = [];
            SmallItems = [];

            InitData();
        }

        private void InitData()
        {
            Console.WriteLine($"Initialize {_count}");
            var largeItemFaker = new Faker<CustomLargeItem>();
            var customItemFaker = new Faker<CustomItem>();
            var smallItemFaker = new Faker<CustomSmallItem>();

            for (int i = 0; i < _count; i++)
            {
                LargeItems.Add(largeItemFaker.Generate());
                Items.Add(customItemFaker.Generate());
                SmallItems.Add(smallItemFaker.Generate());
            }
        }

        public override string ToString()
        {
            return $"{_count} items";
        }
    }
}
