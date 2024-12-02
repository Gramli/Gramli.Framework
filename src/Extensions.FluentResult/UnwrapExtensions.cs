using FluentResults;

namespace Extensions.FluentResult
{
    public static class UnwrapExtensions
    {
        /// <summary>
        /// Unwraps the result. If the result is failed, adds errors to the specified failedError and returns the default value of T.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <returns>The unwrapped value if successful, or the default value of T if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError is null.</exception>
        public static T UnwrapOrWithErrors<T>(this Result<T> result, Result failedError)
        {
            ArgumentNullException.ThrowIfNull(failedError);

            if (result.IsFailed)
            {
                failedError.WithErrors(result.Errors);
                return result.ValueOrDefault;
            }

            return result.Value;
        }

        /// <summary>
        /// Unwraps the result async. If the result is failed, adds errors to the specified failedError and returns the default value of T.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <returns>The unwrapped value if successful, or the default value of T if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError is null.</exception>
        public static async Task<T> UnwrapOrWithErrorsAsync<T>(this Task<Result<T>> resultAsync, Result failedError)
            => UnwrapOrWithErrors(await resultAsync, failedError);

    }
}
