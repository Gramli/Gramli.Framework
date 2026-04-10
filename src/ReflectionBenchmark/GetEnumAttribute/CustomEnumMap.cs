using System.Collections.Frozen;

namespace ReflectionBenchmark.GetEnumAttribute
{
    public static class CustomEnumDescriptionMap
    {
        public static readonly Dictionary<CustomSmallEnum, string> SmallMap = new Dictionary<CustomSmallEnum, string>()
        {
            {CustomSmallEnum.s1,  "s1Description" },
            {CustomSmallEnum.s2,  "s2Description" },
            {CustomSmallEnum.s3,  "s3Description" },
            {CustomSmallEnum.s4,  "s4Description" },
            {CustomSmallEnum.s5,  "s5Description" },
            {CustomSmallEnum.s6,  "s6Description" },
            {CustomSmallEnum.s7,  "s7Description" }
        };

        public static readonly Dictionary<CustomEnum, string> Map = new Dictionary<CustomEnum, string>()
        {
            { CustomEnum.ValueOne, "Value One" },
            { CustomEnum.ValueTwo, "Value Two" },
            { CustomEnum.ValueThree, "Value Three" },
            { CustomEnum.ValueFour, "Value Four" },
            { CustomEnum.ValueFive, "Value Five" },
            { CustomEnum.ValueSix, "Value Six" },
            { CustomEnum.ValueSeven, "Value Seven" },
            { CustomEnum.ValueEight, "Value Eight" },
            { CustomEnum.ValueNine, "Value Nine" },
            { CustomEnum.ValueTen, "Value Ten" },
            { CustomEnum.ValueEleven, "Value Eleven" },
            { CustomEnum.ValueTwelve, "Value Twelve" },
            { CustomEnum.ValueThirteen, "Value Thirteen" },
            { CustomEnum.ValueFourteen, "Value Fourteen" },
            { CustomEnum.ValueFifteen, "Value Fifteen" },
            { CustomEnum.ValueSixteen, "Value Sixteen" },
        };

        public static readonly Dictionary<CustomLargeEnum, string> LargeMap = new Dictionary<CustomLargeEnum, string>()
        {
            {CustomLargeEnum.v1,  "v1Description" },
            {CustomLargeEnum.v2,  "v2Description" },
            {CustomLargeEnum.v3,  "v3Description" },
            {CustomLargeEnum.v4,  "v4Description" },
            {CustomLargeEnum.v5,  "v5Description" },
            {CustomLargeEnum.v6,  "v6Description" },
            {CustomLargeEnum.v7,  "v7Description" },
            {CustomLargeEnum.v8,  "v8Description" },
            {CustomLargeEnum.v9,  "v9Description" },
            {CustomLargeEnum.v10,  "v10Description" },
            {CustomLargeEnum.v11,  "v11Description" },
            {CustomLargeEnum.v12,  "v12Description" },
            {CustomLargeEnum.v13,  "v13Description" },
            {CustomLargeEnum.v14,  "v14Description" },
            {CustomLargeEnum.v15,  "v15Description" },
            {CustomLargeEnum.v16,  "v16Description" },
            {CustomLargeEnum.v17,  "v17Description" },
            {CustomLargeEnum.v18,  "v18Description" },
            {CustomLargeEnum.v19,  "v19Description" },
            {CustomLargeEnum.v20,  "v20Description" },
            {CustomLargeEnum.v21,  "v21Description" },
            {CustomLargeEnum.v22,  "v22Description" },
            {CustomLargeEnum.v23,  "v23Description" },
            {CustomLargeEnum.v24,  "v24Description" },
            {CustomLargeEnum.v25,  "v25Description" },
            {CustomLargeEnum.v26,  "v26Description" },
            {CustomLargeEnum.v27,  "v27Description" },
            {CustomLargeEnum.v28,  "v28Description" },
            {CustomLargeEnum.v29,  "v29Description" },
            {CustomLargeEnum.v30,  "v30Description" },
            {CustomLargeEnum.v31,  "v31Description" },
            {CustomLargeEnum.v32,  "v32Description" },
            {CustomLargeEnum.v33,  "v33Description" },
            {CustomLargeEnum.v34,  "v34Description" },
            {CustomLargeEnum.v35,  "v35Description" }
        };

        public static readonly FrozenDictionary<CustomSmallEnum, string> FrozenSmallMap = SmallMap.ToFrozenDictionary();
        public static readonly FrozenDictionary<CustomEnum, string> FrozenMap = Map.ToFrozenDictionary();
        public static readonly FrozenDictionary<CustomLargeEnum, string> FrozenLargeMap = LargeMap.ToFrozenDictionary();
    }
}
