namespace GeneralBenchmark.ExceptionsAndResult
{
    internal sealed class ResultHandler(Logger logger)
    {
        private readonly Logger _logger = logger;

        public async ValueTask<HandleDto?> Handle(IEnumerable<RequestItem> data)
        {
            if (data is null || !data.Any())
            {
                return default;
            }

            var processResult = await ProcessData(data);

            if (processResult.IsFailed)
            {
                _logger.Log(processResult.Errors);
                return default;
            }

            return new HandleDto { Sum = processResult.Value };
        }

        private static async ValueTask<Result<double>> ProcessData(IEnumerable<RequestItem> data)
        {
            var getValidDataResult = await GetValidData(data);

            if (getValidDataResult.IsFailed)
            {
                return Result<double>.Fail(getValidDataResult.Errors);
            }

            var positiveDataResult = await GetPositiveData(getValidDataResult.Value);

            if (positiveDataResult.IsFailed)
            {
                return Result<double>.Fail(positiveDataResult.Errors);
            }

            return Result<double>.Ok(positiveDataResult.Value.Sum(x => x.Value));
        }

        private static async ValueTask<Result<IEnumerable<RequestItem>>> GetValidData(IEnumerable<RequestItem> inputData)
        {
            if (inputData.All(x => !x.IsValid))
            {
                return Result<IEnumerable<RequestItem>>.Fail("All data are invalid");
            }

            await Task.Yield();

            foreach (var item in inputData)
            {
                var isValidSecondLayerResult = IsValidSecondLayer(item);
                if (isValidSecondLayerResult.IsFailed)
                {
                    return Result<IEnumerable<RequestItem>>.Fail("Second level validation is invalid.")
                        .WithErrors(isValidSecondLayerResult.Errors);
                }
            }

            return Result<IEnumerable<RequestItem>>.Ok(inputData.Where(x => x.IsValid));
        }

        private static Result<bool> IsValidSecondLayer(RequestItem item)
        {
            if (!item.IsValidSecondLayer)
            {
                return Result<bool>.Fail("Item is not valid in the second layer");
            }

            return Result<bool>.Ok(true);
        }

        private static async ValueTask<Result<IEnumerable<RequestItem>>> GetPositiveData(IEnumerable<RequestItem> inputData)
        {
            await Task.Yield();

            if (inputData.All(x => x.Value < 0))
            {
                return Result<IEnumerable<RequestItem>>.Fail("All data are smaller than 0");
            }

            return Result<IEnumerable<RequestItem>>.Ok(inputData.Where(x => x.Value > 0));
        }
    }
}
