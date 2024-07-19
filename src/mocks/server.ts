import { setupServer } from 'msw/node'

import { handlers } from 'mocks/handlers'

export const server = setupServer(...handlers)

export const enableMocking = () => {
  console.log('here')
  if (process.env.NODE_ENV !== 'development') {
    return
  } else return server.listen()
}
