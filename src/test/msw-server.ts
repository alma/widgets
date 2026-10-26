import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { blockAlmaApi } from '@/test/block-alma-api'

// setup-jsdom.ts fails the test on any entry, since the code under test may swallow the error.
export const unhandledRequests: string[] = []

const recordUnhandled = (request: Request) => {
  unhandledRequests.push(`${request.method} ${request.url}`)
}

// Tests add their handlers with server.use(). These fallbacks survive resetHandlers().
export const server = setupServer(
  // Alma API, live and sandbox, as in Storybook.
  ...blockAlmaApi(recordUnhandled),
  // Any other host, so no test reaches the network.
  http.all('*', ({ request }) => {
    recordUnhandled(request)
    return HttpResponse.error()
  }),
)

export const startServer = () => server.listen()
