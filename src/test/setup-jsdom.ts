// What jsdom lacks. The browser project keeps the real implementations.

const useUtc = () => {
  process.env.TZ = 'UTC'
}

// A test may switch to another zone for itself. The next one is back in UTC.
useUtc()
afterEach(useUtc)

// No media query matches, so the widget sees no reduced motion preference.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('no-scroll', () => ({ default: { on: vi.fn(), off: vi.fn(), toggle: vi.fn() } }))

// axe-core draws text on a canvas to detect icon fonts, and jsdom has no canvas.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: [] })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  })),
})
