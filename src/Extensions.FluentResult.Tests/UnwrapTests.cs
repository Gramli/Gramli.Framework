using Extensions.FluentResult.Tests.Data;
using FluentResults;

namespace Extensions.FluentResult.Tests
{
    public class UnwrapTests
    {
        [Fact]
        public void UnwrapOrDefault_Success()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = GetAge().UnwrapOrWithErrors(result, string.Empty),
                People = GetPeople().UnwrapOrWithErrors(result, []),
                Kings = GetKings().UnwrapOrWithErrors(result),
            };

            //assert
            if (result.IsFailed)
            {
                Assert.Fail();
            }

            Assert.Equal("First Age", middleEarth.ActualAge);
        }

        [Fact]
        public void UnwrapOrDefault_ErrorMerged()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = GetAge().UnwrapOrWithErrors(result, string.Empty),
                People = GetPeopleFailed().UnwrapOrWithErrors(result, []),
            };

            //assert
            if (result.IsSuccess)
            {
                Assert.Fail();
            }

            Assert.Single(result.Errors);
        }

        [Fact]
        public async Task UnwrapOrDefault_Async_Success()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = (await GetAgeAsync()).UnwrapOrWithErrors(result, string.Empty),
                People = (await GetPeopleAsync()).UnwrapOrWithErrors(result, []),
                Kings = (await GetKingsAsync()).UnwrapOrWithErrors(result),
            };

            //assert
            if (result.IsFailed)
            {
                Assert.Fail();
            }

            Assert.Equal("First Age", middleEarth.ActualAge);
        }

        [Fact]
        public async Task UnwrapOrDefault_UnwrapOrDefaultAsync_Success()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = await GetAgeAsync().UnwrapOrWithErrorsAsync(result, string.Empty),
                People = await GetPeopleAsync().UnwrapOrWithErrorsAsync(result, []),
                Kings = await GetKingsAsync().UnwrapOrWithErrorsAsync(result, []),
            };

            //assert
            if (result.IsFailed)
            {
                Assert.Fail();
            }

            Assert.Equal("First Age", middleEarth.ActualAge);
        }

        [Fact]
        public async Task UnwrapOrDefault_UnwrapOrDefaultAsync_ErrorMerged()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = await GetAgeFailAsync().UnwrapOrWithErrorsAsync(result, string.Empty),
                People = await GetPeopleFailAsync().UnwrapOrWithErrorsAsync(result, []),
            };

            //assert
            if (result.IsSuccess)
            {
                Assert.Fail();
            }

            Assert.Equal(2, result.Errors.Count);
        }

        public static Result<string> GetAgeFailed()
            => Result.Fail<string>("GetAgeAsync");

        public static Result<IEnumerable<Person>> GetPeopleFailed()
            => Result.Fail<IEnumerable<Person>>("GetPeopleFailAsync");

        public static Result<string> GetAge()
             => Result.Ok(UnwrapData.GetAge());

        public static Result<IEnumerable<King>?> GetKings()
            => Result.Ok<IEnumerable<King>?>(null);

        public static Result<IEnumerable<Person>> GetPeople()
            => Result.Ok<IEnumerable<Person>>(UnwrapData.GetPeople());

        public static Task<Result<string>> GetAgeAsync()
            => Task.FromResult(GetAge());

        public static Task<Result<IEnumerable<Person>>> GetPeopleAsync()
            => Task.FromResult(GetPeople());

        public static Task<Result<IEnumerable<King>?>> GetKingsAsync()
            => Task.FromResult(GetKings());

        public static Task<Result<string>> GetAgeFailAsync()
            => Task.FromResult(GetAgeFailed());

        public static Task<Result<IEnumerable<Person>>> GetPeopleFailAsync()
            => Task.FromResult(GetPeopleFailed());
    }
}
