import { EligibilityPlan, ErrorResponse } from '@/types'

export async function fetchFromApi(
  data: { [key: string]: unknown },
  headers?: { [key: string]: unknown },
  url = '',
): Promise<EligibilityPlan[] | ErrorResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'force-cache',
    body: JSON.stringify(data),
  })
  return response.json()
}
