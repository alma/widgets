import axios from 'axios'

export const makeClient = (baseUrl = '', merchantId = '') => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Alma-Merchant-Auth ${merchantId}`,
      'X-Alma-Agent': `Alma Widget/${process.env.VERSION}`,
    },
  })
}
