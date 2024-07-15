import React, { FC, ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from 'react-query'

import { REACT_QUERY_DEFAULT_OPTIONS } from 'providers/ReactQuery/config.query'

export const queryClient = new QueryClient(
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'storybook'
    ? { defaultOptions: { queries: { retry: false } } }
    : {
        defaultOptions: REACT_QUERY_DEFAULT_OPTIONS,
      },
)

interface Props {
  children: ReactNode
}

const ReactQueryProvider: FC<Props> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

export default ReactQueryProvider
