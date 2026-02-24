/**
 * Safely parse a JSON attribute string.
 */
export const parseJsonAttribute = <T>(value?: string): T | undefined => {
  if (!value) return undefined

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

