export const DESKTOP_WIDTH = 1024
export const MOBILE_WIDTH = 375

// Mobile unless a test says otherwise, like the stub that master's unit tests use.
let width = MOBILE_WIDTH

/**
 * Sets the width that the matchMedia stub of setup.ts answers for. The stub has to be one function
 * for the whole file, because the reference bundle keeps the matchMedia it found when it loaded.
 * A test calls this before a modal mounts, and setup.ts puts the mobile width back after each test.
 */
export const setViewportWidth = (value: number) => {
  width = value
}

/** Whether a media query matches the current width. Only min-width and max-width ever match. */
export const matchesQuery = (query: string): boolean => {
  const min = /\(min-width:\s*(\d+)px\)/.exec(query)
  const max = /\(max-width:\s*(\d+)px\)/.exec(query)
  if (!min && !max) return false
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
}
