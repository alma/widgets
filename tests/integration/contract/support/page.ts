import { afterAll, beforeAll, beforeEach } from 'vitest'

import { loadUmd } from './load-bundle'

export const START = 1638350762000
export const MERCHANT_ID = 'merchant_contract_test'

type Bundle = ReturnType<typeof loadUmd>
type Options = Record<string, unknown>

/**
 * Fakes the timers that Preact's effects use (animation frame and 100 ms timeout). Call it once at
 * the top of a test file. The fake timers stay installed for the whole file, because Preact queues
 * its effects in a module variable, and a timer that the clock drops between two tests would block
 * every later effect.
 */
export const useFakeClock = () => {
  beforeAll(() => {
    vi.useFakeTimers({
      now: START,
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'Date',
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    })
  })
  beforeEach(() => {
    vi.setSystemTime(START)
  })
  afterAll(() => {
    vi.useRealTimers()
  })
}

export const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms)

export const waitFor = async (check: () => boolean, what: string) => {
  for (let elapsed = 0; elapsed < 5000; elapsed += 10) {
    if (check()) return
    // eslint-disable-next-line no-await-in-loop
    await tick(10)
  }
  throw new Error(`Timed out waiting for ${what}`)
}

export const container = () => document.querySelector('#alma-widget') as HTMLElement
export const planButtons = () =>
  Array.from(container().querySelectorAll<HTMLElement>('[role="option"]'))
export const closeButton = () => document.querySelector('[data-testid="modal-close-button"]')

export const loadBundle = (): Bundle => loadUmd()

/** Puts an empty container in the page and adds a widget to it. */
export const addWidget = (
  Alma: Bundle,
  widget: string,
  options: Options = {},
  {
    merchantId = MERCHANT_ID,
    mode = Alma.ApiMode.TEST,
  }: { merchantId?: string; mode?: string } = {},
) => {
  document.body.innerHTML = '<div id="alma-widget"></div>'
  return Alma.Widgets.initialize(merchantId, mode).add(widget, {
    container: '#alma-widget',
    purchaseAmount: 45000,
    ...options,
  })
}

/** Adds a widget to the current page without resetting it. */
export const addAgain = (
  Alma: Bundle,
  widget: string,
  options: Options = {},
  {
    merchantId = MERCHANT_ID,
    mode = Alma.ApiMode.TEST,
  }: { merchantId?: string; mode?: string } = {},
) =>
  Alma.Widgets.initialize(merchantId, mode).add(widget, {
    container: '#alma-widget',
    purchaseAmount: 45000,
    ...options,
  })
