using BenchmarkDotNet.Running;
using ReflectionBenchmark.CreateClassInstance;
using ReflectionBenchmark.GenericExport;
using ReflectionBenchmark.GetEnumAttribute;

//BenchmarkRunner.Run<CreateClassInstanceBenchmark>();
//BenchmarkRunner.Run<GenericExportBenchmark>();
BenchmarkRunner.Run<GetEnumAttributeBenchmark>();
