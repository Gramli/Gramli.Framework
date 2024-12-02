using FluentResults;

namespace Extensions.FluentResult
{
    public static class UnwrapExtensions
    {
        public static T UnwrapOrDefault<T>(this Result<T> result, Result failedError)
        {
            if (result.IsFailed)
            {
                failedError.WithErrors(result.Errors);
                return result.ValueOrDefault;
            }

            return result.Value;
        }

        public static async Task<T> UnwrapOrDefaultAsync<T>(this Task<Result<T>> resultAsync, Result failedError)
            => UnwrapOrDefault(await resultAsync, failedError);

    }
}
