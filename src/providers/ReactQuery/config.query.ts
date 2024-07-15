import { QueryClientConfig } from 'react-query'

export const REACT_QUERY_DEFAULT_OPTIONS: QueryClientConfig['defaultOptions'] = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
  },
}
