// Date helpers with the results of date-fns, which the branch no longer depends on. They work in
// local time, like date-fns, and the tests in date.test.ts pin its output.
const MILLISECONDS_BY_SECOND = 1000

export const fromUnixTime = (unixTime: number): Date => new Date(unixTime * MILLISECONDS_BY_SECOND)

export const getUnixTime = (date: Date): number =>
  Math.trunc(date.getTime() / MILLISECONDS_BY_SECOND)

// Like date-fns, a NaN offset gives an Invalid Date, so a wrong offset shows up as a NaN due date
// instead of passing for a valid one.
export const addDays = (date: Date, amount: number): Date => {
  if (Number.isNaN(amount)) {
    return new Date(NaN)
  }
  const result = new Date(date)
  if (!amount) {
    return result
  }
  result.setDate(result.getDate() + amount)
  return result
}

// Clamps like date-fns: when the start day doesn't exist in the target month, it returns the last
// day of that month (31 January plus one month gives 28 February).
export const addMonths = (date: Date, amount: number): Date => {
  if (Number.isNaN(amount)) {
    return new Date(NaN)
  }
  const result = new Date(date)
  if (!amount) {
    return result
  }
  const dayOfMonth = result.getDate()
  const endOfDesiredMonth = new Date(result)
  endOfDesiredMonth.setMonth(result.getMonth() + amount + 1, 0)
  const daysInMonth = endOfDesiredMonth.getDate()
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth
  }
  result.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth)
  return result
}
