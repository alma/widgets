import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { type ListenerSpies, spyOnListeners } from './support/listener-spies'
import { loadUmd } from './support/load-bundle'
import {
  addAgain,
  addWidget,
  closeButton,
  planButtons,
  tick,
  useFakeClock,
  waitFor,
} from './support/page'

const threePlans = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/eligible-2x-3x-4x.json'), 'utf8'),
)

// The most listeners and timers that the widget may leave. Raising a limit lets a leak through,
// and lowering one below what the widget leaves makes the tests fail.
type Counts = Record<string, number>
const MAX_LISTENERS_AFTER_REPLACEMENT: Counts = {}
// One capturing `focus` listener on `document` may stay, as react-modal leaves it, however many
// times the modal opens.
const MAX_LISTENERS_AFTER_THREE_CYCLES: Counts = { 'document:focus': 1 }
const MAX_TIMERS_AFTER_REPLACEMENT = 0
// The live widget's timers (cycling, announcements, instructions) all end within this time, so only
// timers that outlive a replaced widget are left. Counting earlier would count the live widget's
// timers as leaks.
const SETTLE_MS = 60000
const MAX_TIMERS_AFTER_THREE_CYCLES = 1

let Alma: ReturnType<typeof loadUmd>
let spies: ListenerSpies

// The spies go in before the bundle loads, because the bundle may read window.matchMedia then.
beforeAll(() => {
  spies = spyOnListeners()
  Alma = loadUmd()
})
afterAll(() => {
  spies.restore()
})

useFakeClock()

beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
  spies.reset()
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>.
afterEach(async () => {
  closeButton()?.click()
  await tick(1000)
})

const expectNoMoreThan = (actual: Counts, limit: Counts) => {
  const keys = new Set([...Object.keys(actual), ...Object.keys(limit)])
  const over = Array.from(keys).filter((key) => (actual[key] ?? 0) > (limit[key] ?? 0))
  expect(Object.fromEntries(over.map((key) => [key, actual[key]]))).toEqual(
    Object.fromEntries(over.map((key) => [key, limit[key] ?? 0])),
  )
}

describe('listener spies', () => {
  // The limits allow almost no listener, so a spy that records nothing would pass every leak
  // test. This shows that the spies see a listener on each kind of target.
  it('counts the listeners on window, document, body and a MediaQueryList', () => {
    const listener = () => {}
    const list = window.matchMedia('(min-width: 1px)')
    window.addEventListener('probe', listener)
    document.addEventListener('probe', listener)
    document.body.addEventListener('probe', listener)
    list.addEventListener('change', listener)
    expect(spies.attached()).toEqual({
      'window:probe': 1,
      'document:probe': 1,
      'document.body:probe': 1,
      'MediaQueryList:change': 1,
    })

    window.removeEventListener('probe', listener)
    document.removeEventListener('probe', listener)
    document.body.removeEventListener('probe', listener)
    list.removeEventListener('change', listener)
    expect(spies.attached()).toEqual({})
  })
})

describe('listener spies, options', () => {
  it('counts a capture listener apart from a bubble one, and skips a once listener', () => {
    const listener = () => {}
    document.addEventListener('probe', listener)
    document.addEventListener('probe', listener, true)
    document.addEventListener('probe', () => {}, { once: true })
    expect(spies.attached()).toEqual({ 'document:probe': 2 })

    document.removeEventListener('probe', listener, { capture: true })
    expect(spies.attached()).toEqual({ 'document:probe': 1 })
    document.removeEventListener('probe', listener)
    expect(spies.attached()).toEqual({})
  })
})

describe('leaks', () => {
  it('leaves at most the allowed listeners and timers after a replacement', async () => {
    mockEligibilityApi({ json: threePlans })
    addWidget(Alma, Alma.Widgets.PaymentPlans, {})
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    addAgain(Alma, Alma.Widgets.PaymentPlans, { purchaseAmount: 30000 })
    await tick(500)
    addAgain(Alma, Alma.Widgets.PaymentPlans, {})
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    await tick(SETTLE_MS)

    expectNoMoreThan(spies.attached(), MAX_LISTENERS_AFTER_REPLACEMENT)
    expect(vi.getTimerCount()).toBeLessThanOrEqual(MAX_TIMERS_AFTER_REPLACEMENT)
  })

  it('leaves at most the allowed listeners after three open and close cycles', async () => {
    mockEligibilityApi({ json: threePlans })
    const handle = addWidget(Alma, Alma.Widgets.Modal, {}) as { open: () => void }
    for (let cycle = 0; cycle < 3; cycle += 1) {
      handle.open()
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => closeButton() !== null, 'the modal')
      // eslint-disable-next-line no-await-in-loop
      await tick(500)
      ;(closeButton() as HTMLElement).click()
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => closeButton() === null, 'the modal to close')
    }
    await tick(1000)

    expectNoMoreThan(spies.attached(), MAX_LISTENERS_AFTER_THREE_CYCLES)
    expect(vi.getTimerCount()).toBeLessThanOrEqual(MAX_TIMERS_AFTER_THREE_CYCLES)
  })
})
