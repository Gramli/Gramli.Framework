namespace GeneralBenchmark.ExceptionsAndResult
{
    internal sealed class ThrowExceptionHandler(Logger logger)
    {
        private readonly Logger _logger = logger;

        public async Task<HandleDto?> Handle(IEnumerable<RequestItem> data)
        {
            if (data is null || !data.Any())
            {
                return default;
            }

            try
            {
                var processResult = await ProcessData(data);
                return new HandleDto { Sum = processResult };
            }
            catch (Exception ex)
            {
                _logger.Log(ex);
                return default;
            }
        }

        private static async Task<double> ProcessData(IEnumerable<RequestItem> data)
        {
            var getValidDataResult = await GetValidData(data);

            var positiveDataResult = await GetPositiveData(getValidDataResult);

            return positiveDataResult.Sum(x => x.Value);
        }

        private static async Task<IEnumerable<RequestItem>> GetValidData(IEnumerable<RequestItem> inputData)
        {
            if (inputData.All(x => !x.IsValid))
            {
                throw new ArgumentException("All data are invalid", nameof(inputData));
            }

            foreach (var item in inputData)
            {
                IsValidSecondLayer(item);
            }

            await Task.Yield();
            return inputData.Where(x => x.IsValid);
        }

        private static void IsValidSecondLayer(RequestItem item)
        {
            if (!item.IsValidSecondLayer)
            {
                throw new ArgumentException("Item is not valid in the second layer", nameof(item));
            }
        }

        private static async Task<IEnumerable<RequestItem>> GetPositiveData(IEnumerable<RequestItem> inputData)
        {
            if (inputData.All(x => x.Value < 0))
            {
                throw new ArgumentException("All data are smaller than 0", nameof(inputData));
            }

            await Task.Yield();
            return inputData.Where(x => x.Value > 0);
        }
    }
}
