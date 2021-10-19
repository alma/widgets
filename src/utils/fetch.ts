export async function fetchFromApi(url = '', data: { [key: string]: any }, headers?: any) {
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
