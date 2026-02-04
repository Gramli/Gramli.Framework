namespace GeneralBenchmark.ExceptionsAndResult
{
    internal readonly struct Result<T>
    {
        public T? Value { get; }
        public bool IsFailed { get; }
        public IEnumerable<string> Errors { get; }

        private Result(T value)
        {
            Value = value;
            IsFailed = false;
            Errors = [];
        }

        private Result(IEnumerable<string> errors)
        {
            Value = default;
            IsFailed = true;
            Errors = errors;
        }

        private Result(string error)
        {
            Value = default;
            IsFailed = true;
            Errors = [error];
        }

        public Result<T> WithErrors(IEnumerable<string> errors)
        {
            return new Result<T>(Errors.Concat(errors));
        }

        public static Result<T> Ok(T value) => new(value);
        public static Result<T> Fail(IEnumerable<string> errors) => new(errors);
        public static Result<T> Fail(string error) => new(error);

        public override string ToString()
        {
            return string.Join(string.Empty, Errors);
        }
    }
}
