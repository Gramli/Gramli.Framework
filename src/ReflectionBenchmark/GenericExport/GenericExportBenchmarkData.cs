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
            var largeItemFaker = new Faker<CustomLargeItem>()
                .CustomInstantiator(f => new CustomLargeItem
                {
                    Item1 = f.Random.Int(),
                    Item2 = f.Random.Long(),
                    Item3 = f.Date.Recent(),
                    Item4 = f.Date.Timespan(),
                    Item5 = f.Random.Double(),
                    Item6 = f.Random.Float(),
                    Item7 = f.Lorem.Word(),
                    Item8 = f.Random.Int(),
                    Item9 = f.Random.Long(),
                    Item10 = f.Date.Recent(),
                    Item11 = f.Date.Timespan(),
                    Item12 = f.Random.Double(),
                    Item13 = f.Random.Float(),
                    Item14 = f.Lorem.Word(),
                    Item15 = f.Random.Float(),
                    Item16 = f.Lorem.Word(),
                    Item17 = f.Random.Int(),
                    Item18 = f.Random.Long(),
                    Item19 = f.Date.Recent(),
                    Item20 = f.Date.Timespan(),
                    Item21 = f.Random.Double(),
                    Item22 = f.Random.Float(),
                    Item23 = f.Lorem.Word(),
                    Item24 = f.Random.Int(),
                    Item25 = f.Random.Long(),
                    Item26 = f.Date.Recent(),
                    Item27 = f.Date.Timespan(),
                    Item28 = f.Random.Double(),
                    Item29 = f.Random.Float(),
                    Item30 = f.Lorem.Word(),
                    Item31 = f.Random.Float(),
                    Item32 = f.Lorem.Word(),
                });

            var customItemFaker = new Faker<CustomItem>()
                .CustomInstantiator(f => new CustomItem
                {
                    Item1 = f.Random.Int(),
                    Item2 = f.Random.Long(),
                    Item3 = f.Date.Recent(),
                    Item4 = f.Date.Timespan(),
                    Item5 = f.Random.Double(),
                    Item6 = f.Random.Float(),
                    Item7 = f.Lorem.Word(),
                    Item8 = f.Random.Int(),
                    Item9 = f.Random.Long(),
                    Item10 = f.Date.Recent(),
                    Item11 = f.Date.Timespan(),
                    Item12 = f.Random.Double(),
                    Item13 = f.Random.Float(),
                    Item14 = f.Lorem.Word(),
                    Item15 = f.Random.Float(),
                    Item16 = f.Lorem.Word(),
                });

            var smallItemFaker = new Faker<CustomSmallItem>()
                .CustomInstantiator(f => new CustomSmallItem
                {
                    Item1 = f.Random.Int(),
                    Item2 = f.Random.Long(),
                    Item3 = f.Date.Recent(),
                    Item4 = f.Date.Timespan(),
                    Item5 = f.Random.Double(),
                    Item6 = f.Random.Float(),
                    Item7 = f.Lorem.Word(),
                });

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
