import { fetchFromApi } from '@/shared/lib/http'

const REQUEST = { url: 'https://example.test', body: {} }

describe('fetchFromApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const stubFetch = (response: Response | Promise<Response>) => {
    const fetchMock = vi.fn(() => Promise.resolve(response))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('posts the JSON body with force-cache and merges the headers after the content type', async () => {
    const fetchMock = stubFetch(Response.json([{ installments_count: 3 }]))

    await fetchFromApi({
      url: 'https://example.test/path',
      headers: { Authorization: 'secret' },
      body: { b: 2, a: 1 },
    })

    expect(fetchMock).toHaveBeenCalledWith('https://example.test/path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'secret' },
      cache: 'force-cache',
      body: '{"b":2,"a":1}',
    })
  })

  it('sends only the content type when no header is given', async () => {
    const fetchMock = stubFetch(Response.json({}))

    await fetchFromApi({ url: 'https://example.test', body: {} })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('resolves with the parsed body, whatever the status', async () => {
    stubFetch(Response.json({ error_code: '403' }, { status: 403 }))

    await expect(fetchFromApi(REQUEST)).resolves.toEqual({ error_code: '403' })
  })

  it('rejects when the body is not JSON', async () => {
    stubFetch(new Response('<p>Bad gateway</p>', { status: 502 }))

    await expect(fetchFromApi(REQUEST)).rejects.toThrow(SyntaxError)
  })

  it('rejects when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    )

    await expect(fetchFromApi(REQUEST)).rejects.toThrow('Failed to fetch')
  })
})
