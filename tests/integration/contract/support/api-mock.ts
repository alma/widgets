export type EligibilityReply =
  { json: unknown; status?: number } | { networkError: true } | { pending: true }

export type RecordedCall = {
  url: string
  method: string
  // Header names in lower case.
  headers: Record<string, string>
  // The request body parsed from JSON.
  body: unknown
  cache: RequestCache | undefined
}

export type EligibilityApi = {
  calls: RecordedCall[]
  /** Answers every request that a `{ pending: true }` reply holds back. */
  release: (json: unknown, status?: number) => void
}

const jsonResponse = (json: unknown, status = 200) =>
  new Response(JSON.stringify(json), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Stubs the global fetch. The stub is removed after each test by support/setup.ts. */
export const mockEligibilityApi = (reply: EligibilityReply): EligibilityApi => {
  const calls: RecordedCall[] = []
  const held: Array<(response: Response) => void> = []

  vi.stubGlobal('fetch', (input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({
      url: String(input),
      method: init.method ?? 'GET',
      headers: Object.fromEntries(new Headers(init.headers).entries()),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
      cache: init.cache,
    })
    if ('networkError' in reply) return Promise.reject(new TypeError('Failed to fetch'))
    if ('pending' in reply) {
      return new Promise<Response>((resolve) => {
        held.push(resolve)
      })
    }
    return Promise.resolve(jsonResponse(reply.json, reply.status))
  })

  return {
    calls,
    release: (json, status) => {
      held.splice(0).forEach((resolve) => resolve(jsonResponse(json, status)))
    },
  }
}
