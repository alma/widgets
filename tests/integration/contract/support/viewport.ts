const MOBILE_WIDTH = 375

/** Whether a media query matches a mobile width. Only min-width and max-width ever match. */
export const matchesQuery = (query: string): boolean => {
  const min = /\(min-width:\s*(\d+)px\)/.exec(query)
  const max = /\(max-width:\s*(\d+)px\)/.exec(query)
  if (!min && !max) return false
  return (!min || MOBILE_WIDTH >= Number(min[1])) && (!max || MOBILE_WIDTH <= Number(max[1]))
}
