export const isMoreThanOneHourAgo = (date: number): boolean => {
  const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60
  const currentTime = Date.now()
  const difference = currentTime - date

  return difference >= ONE_HOUR_IN_MILLISECONDS
}
