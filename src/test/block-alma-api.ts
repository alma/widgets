// Shared with Storybook, so no Vitest import.
import { http, HttpResponse } from 'msw'

import { ApiMode } from '@/public-api/public-api.const'

// Storybook logs the blocked request, tests record it.
export const blockAlmaApi = (onBlocked: (request: Request) => void) =>
  Object.values(ApiMode).map((origin) =>
    http.all(`${origin}/*`, ({ request }) => {
      onBlocked(request)
      return HttpResponse.error()
    }),
  )
