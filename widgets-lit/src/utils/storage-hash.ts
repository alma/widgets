/**
 * Hashing utilities for session storage cache keys
 * Based on https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */

/**
 * Hash a string using a simple but effective algorithm
 * Ensures consistent, short cache keys even with long parameter combinations
 */
export const hashStringForStorage = (str: string): string =>
  str
    .split('')
    .reduce((hash, char) => {
      // Shift left by 5 bits (multiply by 32), subtract original value, add char code
      // Bitwise OR with 0 ensures 32-bit integer
      // eslint-disable-next-line no-bitwise
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0
    }, 0)
    .toString()
    .replace('-', 'A') // Replace negative sign with 'A' for alphanumeric keys

/**
 * Check if a timestamp is more than one hour old
 * Used to determine if cached data should be refreshed
 */
export const isMoreThanOneHourAgo = (timestamp: number): boolean => {
  const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60
  return Date.now() - timestamp >= ONE_HOUR_IN_MILLISECONDS
}
