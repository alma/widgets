import '@testing-library/jest-dom/vitest'
import type { Mock, MockInstance } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'

import { resetWarnOnce } from '@/lib/errors'
import { TODAY } from '@/test/fixtures/plan-builders'

expect.extend(axeMatchers)

let sendBeacon: Mock<Navigator['sendBeacon']>
let imageSrc: MockInstance<(value: string) => void>

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(TODAY)
  // jsdom has no sendBeacon, and Chromium's would really send one.
  sendBeacon = vi.fn<Navigator['sendBeacon']>(() => true)
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    writable: true,
    value: sendBeacon,
  })
  imageSrc = vi.spyOn(HTMLImageElement.prototype, 'src', 'set')
})

// Light DOM elements and the modal portal leave their DOM in <body>, so each test starts from an
// empty page.
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  document.body.replaceChildren()
  document.body.classList.remove('ReactModal__Body--open')
  sessionStorage.clear()
  resetWarnOnce()
})

// Fails on any beacon, even one the code caught. Runs before the cleanup above.
afterEach(() => {
  const beacons = [...sendBeacon.mock.calls]
  const imageSources = [...imageSrc.mock.calls]
  // Chromium's own sendBeacon is on Navigator.prototype, so deleting the stub puts it back.
  Reflect.deleteProperty(navigator, 'sendBeacon')
  imageSrc.mockRestore()
  expect(beacons, 'navigator.sendBeacon calls, but the widget sends no tracking').toEqual([])
  expect(imageSources, 'image src sets, but the widget sends no tracking').toEqual([])
})
