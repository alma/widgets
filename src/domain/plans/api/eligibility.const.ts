// An entry this old or older has expired.
export const CACHE_TTL_MS = 60 * 60 * 1000

export const StatusResponse = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

// The value and its type share a name, like the enum they replace.
export type StatusResponse = (typeof StatusResponse)[keyof typeof StatusResponse]
