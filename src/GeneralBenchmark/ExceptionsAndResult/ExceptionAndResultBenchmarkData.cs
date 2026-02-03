namespace GeneralBenchmark.ExceptionsAndResult
{
    public sealed class ExceptionAndResultBenchmarkData
    {
        private readonly int _count;
        public List<RequestItem> RequestData { get; } = [];
        public ExceptionAndResultBenchmarkData(int count)
        {
            _count = count;
            InitData();
        }

        private void InitData()
        {
            for (var i = 0; i < _count; i++)
            {
                var isValid = i % 2 == 0;
                var isValidSecondLayer = i % 3 == 0;

                RequestData.Add(new RequestItem
                {
                    IsValid = isValid,
                    Value = -1,
                    IsValidSecondLayer = isValidSecondLayer
                });
            }
        }

        public override string ToString()
        {
            return $"{_count} items";
        }
    }
}
