import type { ApiRequest } from '@/shared/lib/http.types'

export async function fetchFromApi<T>({ url, headers, body }: ApiRequest): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'force-cache',
    body: JSON.stringify(body),
  })
  return response.json()
}
