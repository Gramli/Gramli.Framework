namespace GeneralBenchmark.ExceptionsAndResult
{
    public sealed class ExceptionAndResultBenchmarkData
    {
        private readonly int _count;
        public List<RequestItem> RequestData { get; } = [];
        public ExceptionAndResultBenchmarkData(int count, bool valid = false)
        {
            _count = count;
            InitData(valid);
        }

        private void InitData(bool valid)
        {
            for (var i = 0; i < _count; i++)
            {
                var isValid = i % 2 == 0;
                var isValidSecondLayer = i % 3 == 0;

                RequestData.Add(new RequestItem
                {
                    IsValid = valid ? valid : isValid,
                    Value = valid ? 1 : - 1,
                    IsValidSecondLayer = valid ? valid : isValidSecondLayer
                });
            }
        }

        public override string ToString()
        {
            return $"{_count} items";
        }
    }
}
