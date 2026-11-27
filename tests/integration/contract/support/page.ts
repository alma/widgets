import { afterAll, beforeAll, beforeEach } from 'vitest'

import { deepQueryAll } from './dom'
import type { loadUmd } from './load-bundle'

const START = 1638350762000
const MERCHANT_ID = 'merchant_contract_test'

type Bundle = ReturnType<typeof loadUmd>
type Options = Record<string, unknown>

/**
 * Fakes the timers, the animation frame and Date. Call it once at the top of a test file. The fake
 * timers stay installed for the whole file.
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

// The queries look inside the shadow roots, so they work whether an element renders in one or not.
const container = () => document.querySelector('#alma-widget') as HTMLElement
export const planButtons = (root: ParentNode = container()) =>
  deepQueryAll<HTMLElement>(root, '[role="option"]')
export const closeButton = (doc = document) =>
  deepQueryAll<HTMLElement>(doc, '[data-testid="modal-close-button"]')[0] ?? null
// The modal is a div with role="dialog" until it becomes an open <dialog>.
export const modalDialog = (doc = document) =>
  deepQueryAll(doc, 'dialog[open], [role="dialog"]')[0] ?? null

/** Puts an empty container in the page and adds a widget to it. */
export const addWidget = (
  Alma: Bundle,
  widget: string,
  options: Options = {},
  {
    merchantId = MERCHANT_ID,
    mode = Alma.ApiMode.TEST,
    doc = document,
  }: { merchantId?: string; mode?: string; doc?: Document } = {},
) => {
  const { body } = doc
  body.innerHTML = '<div id="alma-widget"></div>'
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
