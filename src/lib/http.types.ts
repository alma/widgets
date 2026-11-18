// fetchFromApi() POSTs `body` as JSON.
export type ApiRequest = {
  url: string
  headers?: { [key: string]: string }
  body: { [key: string]: unknown }
}
