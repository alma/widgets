import { MOBILE_WIDTH, matchesQuery, setViewportWidth } from './viewport'

// The reference bundle reads window.matchMedia once, when it loads, and jsdom has none. This stub
// is installed before any bundle loads and stays the same function. What it matches depends on the
// width of support/viewport.ts: mobile by default, which matches no query. A reduced-motion query
// never matches.
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
  setViewportWidth(MOBILE_WIDTH)
  document.body.replaceChildren()
  // The eligibility cache lives in sessionStorage and would answer the next test without a request.
  sessionStorage.clear()
  vi.unstubAllGlobals()
})
