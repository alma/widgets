import { EligibilityPlan } from 'types'

export async function fetchFromApi(
  url = '',
  data: { [key: string]: unknown },
  headers?: { [key: string]: unknown },
): Promise<EligibilityPlan[]> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
  return response.json()
}
