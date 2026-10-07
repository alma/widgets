export async function fetchFromApi<T>(
  data: { [key: string]: unknown },
  headers?: { [key: string]: unknown },
  url = '',
): Promise<T> {
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
