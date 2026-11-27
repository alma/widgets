import { matchesQuery } from './viewport'

// The bundle may read window.matchMedia once, when it loads, and jsdom has none. This stub
// is installed before any bundle loads and stays the same function. It answers for a mobile width,
// and a reduced-motion query never matches.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: matchesQuery(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  document.body.replaceChildren()
  // The eligibility cache lives in sessionStorage and would answer the next test without a request.
  sessionStorage.clear()
  vi.unstubAllGlobals()
})
