using Extensions.FluentResult.Tests.Data;
using FluentResults;

namespace Extensions.FluentResult.Tests
{
    public class UnwrapTests
    {
        [Fact]
        public void UnwrapOrDefault_FailedError()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = GetAge().UnwrapOrDefault(result),
                People = GetPeople().UnwrapOrDefault(result),
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
                ActualAge = GetAge().UnwrapOrDefault(result),
                People = GetPeopleFailed().UnwrapOrDefault(result),
            };

            //assert
            if (result.IsSuccess)
            {
                Assert.Fail();
            }

            Assert.Single(result.Errors);
        }

        [Fact]
        public async Task UnwrapOrDefault_Async_FailedError()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = (await GetAgeAsync()).UnwrapOrDefault(result),
                People = (await GetPeopleAsync()).UnwrapOrDefault(result),
            };

            //assert
            if (result.IsFailed)
            {
                Assert.Fail();
            }

            Assert.Equal("First Age", middleEarth.ActualAge);
        }

        [Fact]
        public async Task UnwrapOrDefault_UnwrapOrDefaultAsync()
        {
            //arrange
            var result = new Result();

            //act
            var middleEarth = new MiddleEarth
            {
                ActualAge = await GetAgeAsync().UnwrapOrDefaultAsync(result),
                People = await GetPeopleAsync().UnwrapOrDefaultAsync(result),
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
                ActualAge = await GetAgeFailAsync().UnwrapOrDefaultAsync(result),
                People = await GetPeopleFailAsync().UnwrapOrDefaultAsync(result),
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

        public static Result<IEnumerable<Person>> GetPeople()
            => Result.Ok<IEnumerable<Person>>(UnwrapData.GetPeople());

        public static Task<Result<string>> GetAgeAsync()
            => Task.FromResult(GetAge());

        public static Task<Result<IEnumerable<Person>>> GetPeopleAsync()
            => Task.FromResult(GetPeople());

        public static Task<Result<string>> GetAgeFailAsync()
            => Task.FromResult(GetAgeFailed());

        public static Task<Result<IEnumerable<Person>>> GetPeopleFailAsync()
            => Task.FromResult(GetPeopleFailed());
    }
}
