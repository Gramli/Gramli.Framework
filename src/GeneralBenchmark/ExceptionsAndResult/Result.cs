namespace GeneralBenchmark.ExceptionsAndResult
{
    internal class Result<T>
    {
        public T? Value { get; }
        public bool IsFailed { get; private set; }
        public List<string> Errors { get; } = [];

        private Result(T value)
        {
            Value = value;
        }

        private Result(List<string> errors)
        {
            IsFailed = true;
            Errors = errors;
        }

        private Result(string error)
        {
            IsFailed = true;
            Errors.Add(error);
        }

        public Result<T> WithErrors(IEnumerable<string> errors)
        {
            IsFailed = true;
            Errors.AddRange(errors);
            return this;
        }

        public static Result<T> Ok(T value) => new(value);
        public static Result<T> Fail(List<string> errors) => new(errors);
        public static Result<T> Fail(string error) => new(error);

        public override string ToString()
        {
            return string.Join(string.Empty, Errors);
        }
    }
}
