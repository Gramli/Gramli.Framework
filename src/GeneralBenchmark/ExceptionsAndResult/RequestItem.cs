namespace GeneralBenchmark.ExceptionsAndResult
{
    public record RequestItem
    {
        public bool IsValid { get; init; }
        public double Value { get; init; }
        public bool IsValidSecondLayer { get; init; }
    }
}
