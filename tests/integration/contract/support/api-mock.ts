export type EligibilityReply = { json: unknown; status?: number } | { networkError: true }

export type RecordedCall = {
  // Header names in lower case.
  headers: Record<string, string>
  // The request body as sent, for tests that pin the order of the keys.
  rawBody: unknown
}

export type EligibilityApi = {
  calls: RecordedCall[]
}

const jsonResponse = (json: unknown, status = 200) =>
  new Response(JSON.stringify(json), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Stubs the global fetch. The stub is removed after each test by support/setup.ts. */
export const mockEligibilityApi = (reply: EligibilityReply): EligibilityApi => {
  const calls: RecordedCall[] = []

  vi.stubGlobal('fetch', (_input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({
      headers: Object.fromEntries(new Headers(init.headers).entries()),
      rawBody: init.body,
    })
    if ('networkError' in reply) return Promise.reject(new TypeError('Failed to fetch'))
    return Promise.resolve(jsonResponse(reply.json, reply.status))
  })

  return { calls }
}
