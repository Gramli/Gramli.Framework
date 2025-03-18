namespace GeneralBenchmark.CopyToAndWrite
{
    public class CopyToAndWriteBenchmarkData
    {
        public byte[] ByteData { get; }
        private static readonly Random _random = new();
        public CopyToAndWriteBenchmarkData(int dataLength)
        {
            ByteData = new byte[dataLength];
            _random.NextBytes(ByteData);
        }

        public override string ToString()
        {
            return $"{ByteData.Length / 1024} KB";
        }
    }
}
