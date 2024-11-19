/* eslint-disable */
// Function to hash a string
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export const hashStringForStorage = (str: string): string =>
  str
    // The input string is split into an array of characters.
    .split('')
    // The reduce function is used to apply a function against an accumulator and each element in the array (from left to right) to reduce it to a single output value.
    .reduce(
      (a, b) =>
        // The accumulator (a) is shifted left by 5 bits (multiplied by 32), then subtracted by itself and added to the ASCII value of the current character (b).
        // The bitwise OR operation with 0 is used to ensure the result is a 32-bit integer.
        // eslint-disable-next-line no-bitwise
        ((a << 5) - a + b.charCodeAt(0)) | 0,
      0,
    ) // The initial value of the accumulator is 0.
    .toString() // The result is then converted to a string.
    .replace('-', 'A') // If the hash is negative (which is represented by a leading '-'), it's replaced with 'A' to ensure the hash is alphanumeric.

export const isMoreThanOneHourAgo = (date: number): boolean => {
  const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60
  const currentTime = Date.now()
  const difference = currentTime - date

  return difference >= ONE_HOUR_IN_MILLISECONDS
}
