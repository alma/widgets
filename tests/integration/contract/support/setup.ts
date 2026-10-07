// The reference bundle reads window.matchMedia once, when it loads, and jsdom has none. This stub
// matches no query, like the one master's unit tests use. It is installed before any bundle loads.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
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
