import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { containerChildren } from './support/dom'
import { loadUmd } from './support/load-bundle'

// Options tested elsewhere:
// - `container` and `purchaseAmount` are set by every test of the contract folder. The request body
//   built from `purchaseAmount`, `customerBillingCountry`, `customerShippingCountry` and
//   `merchantCoversAllFees` is LIT-06.
// - `onModalClose`, `onClose` and `clickableSelector` are LIT-07. api-shape.test.ts also checks the
//   event that the two callbacks get.
// - Invalid values such as NaN or `fr_FR` are LIT-08.

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const messages = (locale: string): Record<string, string> =>
  JSON.parse(
    readFileSync(resolve(__dirname, `../../../src/intl/messages/messages.${locale}.json`), 'utf8'),
  )

const threePlans = fixture('eligible-2x-3x-4x')
const creditPlans = fixture('eligible-2x-3x-4x-10x-credit')
const allEligible = fixture('all-eligible')
const ineligiblePlans = fixture('ineligible-amount-2x-3x-4x')

const plan = (installmentsCount: number, minAmount = 100, maxAmount = 200000) => ({
  installmentsCount,
  minAmount,
  maxAmount,
})
const plans2x3x4x = [plan(2), plan(3), plan(4)]

type Bundle = ReturnType<typeof loadUmd>
type Options = Record<string, unknown>

let Alma: Bundle
beforeAll(() => {
  Alma = loadUmd()
})

// Preact runs its effects after an animation frame or a 100 ms timeout, so both are faked. The
// fake timers stay installed for the whole file. Preact queues its effects in a module variable,
// and a timer that the clock drops between two tests would block every later effect.
const START = 1638350762000

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

const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms)

const add = (widget: string, options: Options = {}) => {
  document.body.innerHTML = '<div id="alma-widget"></div>'
  return Alma.Widgets.initialize('merchant_contract_test', Alma.ApiMode.TEST).add(widget, {
    container: '#alma-widget',
    purchaseAmount: 45000,
    ...options,
  })
}

const container = () => document.querySelector('#alma-widget') as HTMLElement

const waitFor = async (check: () => boolean, what: string) => {
  for (let elapsed = 0; elapsed < 5000; elapsed += 10) {
    if (check()) return
    // eslint-disable-next-line no-await-in-loop
    await tick(10)
  }
  throw new Error(`Timed out waiting for ${what}`)
}

const buttons = () => Array.from(container().querySelectorAll<HTMLElement>('[role="option"]'))
const labels = () => buttons().map((button) => button.textContent)
const activeLabel = () =>
  container().querySelector('.alma-payment-plans-active-option')?.textContent ?? null

/** Adds a PaymentPlans widget and waits for its plan buttons. */
const renderPlans = async (options: Options = {}, json: unknown = threePlans) => {
  const api = mockEligibilityApi({ json })
  add(Alma.Widgets.PaymentPlans, options)
  await waitFor(() => buttons().length > 0, 'the plan buttons')
  return api
}

type Change = { label: string | null; at: number }

/** Records each change of the active plan during `duration` ms, with the time since the call. */
const watchActivePlan = async (duration: number, granularity: number) => {
  const start = Date.now()
  const changes: Change[] = []
  let last = activeLabel()
  for (let elapsed = 0; elapsed < duration; elapsed += granularity) {
    // eslint-disable-next-line no-await-in-loop
    await tick(granularity)
    const label = activeLabel()
    if (label !== last) {
      changes.push({ label, at: Date.now() - start })
      last = label
    }
  }
  return changes
}

/**
 * Master restarts the cycling timer on every re-render, and the announcement clears 1000 ms after
 * each plan change, which re-renders. So a step comes later than `transitionDelay`. The checks are
 * about order and bounds, not exact times.
 */
const expectCycling = async (options: Options, transitionDelay: number) => {
  const step = Math.max(transitionDelay, 1000)
  await renderPlans(options)
  const [first, second, third] = labels()
  expect(labels()).toHaveLength(3)
  expect(activeLabel()).toBe(first)

  // Nothing changes during the first `step` ms, then it goes 2x, 3x, 4x, 2x.
  const granularity = 25
  const changes = await watchActivePlan(3 * (step + 5000), granularity)
  expect(changes.slice(0, 3).map(({ label }) => label)).toEqual([second, third, first])
  expect(changes[0].at).toBeGreaterThanOrEqual(step)
  changes.slice(0, 3).forEach(({ at }, index) => {
    const previous = index === 0 ? 0 : changes[index - 1].at
    expect(at - previous).toBeLessThanOrEqual(step + 5000 + granularity)
  })

  // Nothing changes after the return to the first plan.
  expect(changes).toHaveLength(3)
  expect(await watchActivePlan(3 * (step + 5000), 250)).toEqual([])
}

/** The suggested plan becomes active in an effect, a little after the plan buttons render. */
const SETTLE = 200

const expectNoCycling = async (options: Options, json: unknown = threePlans) => {
  await renderPlans(options, json)
  const initial = activeLabel()
  expect(await watchActivePlan(60000, 250)).toEqual([])
  expect(activeLabel()).toBe(initial)
}

const classOf = (element: Element | null) => element?.getAttribute('class') ?? ''
const hasModuleClass = (element: Element | null, name: string) =>
  classOf(element)
    .split(/\s+/)
    .some((token) => token.startsWith(`_${name}_`))
const anyModuleClass = (name: string) =>
  Array.from(container().querySelectorAll('*')).some((element) => hasModuleClass(element, name))

const root = () => container().querySelector('#alma-widget-payment-plans-main-container')
const activeButton = () => container().querySelector('.alma-payment-plans-active-option')
const knowMoreButton = () => container().querySelector('button[aria-haspopup="dialog"]')
const logoFill = () =>
  container().querySelector('[data-testid="Alma-Logo"] path')?.getAttribute('fill')
const title = () => container().querySelector('#payment-plans-title')?.textContent

const openModalFromPlans = async (options: Options, json: unknown = threePlans) => {
  await renderPlans(options, json)
  buttons()[0].click()
  await waitFor(
    () => document.querySelector('[data-testid="modal-close-button"]') !== null,
    'the modal',
  )
}

const openStandaloneModal = async (options: Options, json: unknown = threePlans) => {
  mockEligibilityApi({ json })
  const handle = add(Alma.Widgets.Modal, options) as { open: () => void }
  handle.open()
  await waitFor(
    () => document.querySelector('[data-testid="modal-close-button"]') !== null,
    'the modal',
  )
  // The modal opens while the plans load.
  await tick(500)
}

const cardLogos = () =>
  Array.from(document.querySelectorAll('[data-testid^="card-logo-"]')).map((element) =>
    element.getAttribute('data-testid'),
  )

describe('PaymentPlans locale', () => {
  it('uses English without locale', async () => {
    await renderPlans()
    expect(title()).toBe(messages('en')['accessibility.payment-plans.section-title'])
  })

  it('uses French for fr', async () => {
    await renderPlans({ locale: 'fr' })
    expect(title()).toBe(messages('fr')['accessibility.payment-plans.section-title'])
  })

  it('picks the catalogue from the first two letters, so fr-FR gives French', async () => {
    await renderPlans({ locale: 'fr-FR' })
    expect(title()).toBe(messages('fr')['accessibility.payment-plans.section-title'])
  })
})

describe('PaymentPlans monochrome', () => {
  it('is on by default', async () => {
    await renderPlans()
    expect(hasModuleClass(root(), 'monochrome')).toBe(true)
    expect(hasModuleClass(knowMoreButton(), 'monochrome')).toBe(true)
    expect(hasModuleClass(activeButton(), 'monochrome')).toBe(true)
    expect(logoFill()).toBe('var(--off-black)')
  })

  it('removes every _monochrome_ class and uses the Alma orange when false', async () => {
    await renderPlans({ monochrome: false })
    expect(anyModuleClass('monochrome')).toBe(false)
    expect(logoFill()).toBe('#fa5022')
  })

  it('is on for true', async () => {
    await renderPlans({ monochrome: true })
    expect(hasModuleClass(root(), 'monochrome')).toBe(true)
    expect(logoFill()).toBe('var(--off-black)')
  })

  it('is off for null', async () => {
    // Master applies the default only to undefined, so null turns monochrome off.
    await renderPlans({ monochrome: null })
    expect(anyModuleClass('monochrome')).toBe(false)
    expect(logoFill()).toBe('#fa5022')
  })
})

describe('PaymentPlans hideBorder', () => {
  it('puts no _hideBorder_ class on the root by default', async () => {
    await renderPlans()
    expect(hasModuleClass(root(), 'hideBorder')).toBe(false)
  })

  it('puts a _hideBorder_ class on the root when true', async () => {
    await renderPlans({ hideBorder: true })
    expect(hasModuleClass(root(), 'hideBorder')).toBe(true)
  })

  it('puts none when false or null', async () => {
    await renderPlans({ hideBorder: false })
    expect(hasModuleClass(root(), 'hideBorder')).toBe(false)
    await renderPlans({ hideBorder: null })
    expect(hasModuleClass(root(), 'hideBorder')).toBe(false)
  })

  it('never puts it on the loading div', async () => {
    // Master ignores hideBorder while loading. This records it as it is.
    mockEligibilityApi({ pending: true })
    add(Alma.Widgets.PaymentPlans, { hideBorder: true })
    await tick(500)
    const loading = container().firstElementChild
    expect(loading).not.toBeNull()
    expect(container().querySelector('[role="option"]')).toBeNull()
    expect(hasModuleClass(loading, 'widgetContainer')).toBe(true)
    expect(anyModuleClass('hideBorder')).toBe(false)

    mockEligibilityApi({ pending: true })
    add(Alma.Widgets.PaymentPlans)
    await tick(500)
    expect(anyModuleClass('hideBorder')).toBe(false)
  })
})

describe('PaymentPlans transitionDelay', () => {
  it('cycles with the default delay of 5500 ms', async () => {
    await expectCycling({}, 5500)
  })

  it('cycles with 1000 ms', async () => {
    await expectCycling({ transitionDelay: 1000 }, 1000)
  })

  it('cycles with 2000 ms', async () => {
    await expectCycling({ transitionDelay: 2000 }, 2000)
  })

  it('uses the floor of 1000 ms for 200', async () => {
    await expectCycling({ transitionDelay: 200 }, 200)
  })

  it('uses the floor of 1000 ms for 0', async () => {
    // Without suggestedPaymentPlan, 0 is a delay like any other, so the floor applies.
    await expectCycling({ transitionDelay: 0 }, 0)
  })

  it('uses the default delay for null', async () => {
    await expectCycling({ transitionDelay: null }, 5500)
  })

  it('reads a numeric string as a number', async () => {
    await expectCycling({ transitionDelay: '2000' }, 2000)
  })

  it('does not cycle for -1', async () => {
    // Master turns cycling off for any negative value. This records it as it is.
    await expectNoCycling({ transitionDelay: -1 })
  })

  it('does not cycle for -5', async () => {
    await expectNoCycling({ transitionDelay: -5 })
  })

  it('does not cycle for a negative numeric string', async () => {
    await expectNoCycling({ transitionDelay: '-1' })
  })

  describe('with reduced motion', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'matchMedia') as PropertyDescriptor

    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        ...original,
        value: (query: string) => ({
          ...original.value(query),
          matches: query === '(prefers-reduced-motion: reduce)',
        }),
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'matchMedia', original)
    })

    it('does not cycle', async () => {
      await expectNoCycling({})
    })

    it('does not cycle with a transitionDelay of 1000', async () => {
      await expectNoCycling({ transitionDelay: 1000 })
    })
  })
})

describe('PaymentPlans suggestedPaymentPlan', () => {
  const eligibleLabel = (installmentsCount: number) => {
    const index = [2, 3, 4, 10].indexOf(installmentsCount)
    return labels()[index]
  }

  it('makes the matching plan active at render, without cycling', async () => {
    await renderPlans({ suggestedPaymentPlan: 4 }, creditPlans)
    await tick(SETTLE)
    expect(activeLabel()).toBe(eligibleLabel(4))
    expect(await watchActivePlan(60000, 250)).toEqual([])
  })

  it('makes the first eligible match of a list active', async () => {
    await renderPlans({ suggestedPaymentPlan: [10, 4] }, creditPlans)
    await tick(SETTLE)
    expect(activeLabel()).toBe(eligibleLabel(10))
    expect(await watchActivePlan(60000, 250)).toEqual([])
  })

  it('skips the entries of a list that match nothing', async () => {
    await renderPlans({ suggestedPaymentPlan: [6, 4] }, creditPlans)
    await tick(SETTLE)
    expect(activeLabel()).toBe(eligibleLabel(4))
  })

  it('keeps the first button active with no eligible match', async () => {
    await renderPlans({ suggestedPaymentPlan: 6 }, creditPlans)
    await tick(SETTLE)
    expect(activeLabel()).toBe(labels()[0])
    expect(await watchActivePlan(60000, 250)).toEqual([])
  })

  it('starts on the match, then cycles, with a transitionDelay of 1000', async () => {
    await renderPlans({ suggestedPaymentPlan: 4, transitionDelay: 1000 })
    await tick(SETTLE)
    const [first, , third] = labels()
    expect(activeLabel()).toBe(third)
    const changes = await watchActivePlan(2 * (1000 + 5000), 25)
    expect(changes[0].label).toBe(first)
    expect(changes[0].at + SETTLE).toBeLessThanOrEqual(1000 + 5000 + 25 + SETTLE)
  })

  it('does not cycle with a transitionDelay of 0', async () => {
    // Master treats 0 as "no delay given" when suggestedPaymentPlan is set, so it doesn't cycle.
    // This records it as it is. Without suggestedPaymentPlan, 0 cycles with the 1000 ms floor.
    await renderPlans({ suggestedPaymentPlan: 4, transitionDelay: 0 })
    await tick(SETTLE)
    expect(activeLabel()).toBe(labels()[2])
    expect(await watchActivePlan(60000, 250)).toEqual([])
  })

  it('counts null as set: first plan active, no cycling', async () => {
    // Master tests `suggestedPaymentPlan !== undefined`, so null counts as a choice.
    await expectNoCycling({ suggestedPaymentPlan: null })
    expect(activeLabel()).toBe(labels()[0])
  })

  it('does not match a numeric string, and counts it as set', async () => {
    // Master compares installment counts with ===, so '4' matches nothing. This records it as it is.
    await expectNoCycling({ suggestedPaymentPlan: '4' })
    expect(activeLabel()).toBe(labels()[0])
  })

  it('does not cycle with a null transitionDelay either', async () => {
    await renderPlans({ suggestedPaymentPlan: 4, transitionDelay: null })
    await tick(SETTLE)
    expect(activeLabel()).toBe(labels()[2])
    expect(await watchActivePlan(60000, 250)).toEqual([])
  })

  it('cycles with a numeric string transitionDelay', async () => {
    await renderPlans({ suggestedPaymentPlan: 4, transitionDelay: '1000' })
    await tick(SETTLE)
    expect(activeLabel()).toBe(labels()[2])
    const changes = await watchActivePlan(1000 + 5000 + 25, 25)
    expect(changes.length).toBeGreaterThan(0)
  })
})

describe('PaymentPlans hideIfNotEligible', () => {
  const notEligibleButtons = () =>
    Array.from(
      container().querySelectorAll('[role="option"].alma-payment-plans-not-eligible-option'),
    )

  it('shows not eligible buttons by default', async () => {
    await renderPlans({}, ineligiblePlans)
    expect(buttons()).toHaveLength(3)
    expect(notEligibleButtons()).toHaveLength(3)
    buttons().forEach((button) => {
      expect(button.classList.contains('alma-payment-plans-not-eligible-option')).toBe(true)
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('-1')
    })
  })

  it('shows them for false and null', async () => {
    await renderPlans({ hideIfNotEligible: false }, ineligiblePlans)
    expect(notEligibleButtons()).toHaveLength(3)
    await renderPlans({ hideIfNotEligible: null }, ineligiblePlans)
    expect(notEligibleButtons()).toHaveLength(3)
  })

  it('leaves the container empty when true', async () => {
    mockEligibilityApi({ json: ineligiblePlans })
    add(Alma.Widgets.PaymentPlans, { hideIfNotEligible: true })
    await tick(2000)
    expect(containerChildren(container())).toHaveLength(0)
  })

  it('still shows the widget when true and a plan is eligible', async () => {
    await renderPlans({ hideIfNotEligible: true })
    expect(buttons()).toHaveLength(3)
  })
})

describe('PaymentPlans plans', () => {
  it('hides the pay-now plan of the API without plans', async () => {
    await renderPlans({}, allEligible)
    const texts = labels().join('|')
    expect(texts).not.toContain(messages('en')['payment-plan-strings.pay.now.button'])
  })

  it('shows the pay-now plan first when plans has an entry for it', async () => {
    await renderPlans({ plans: [plan(1), ...plans2x3x4x] }, allEligible)
    expect(labels()).toHaveLength(4)
    expect(labels()[0]).toBe(messages('en')['payment-plan-strings.pay.now.button'])
  })

  it('hides an API plan with no matching entry', async () => {
    await renderPlans({ plans: [plan(2), plan(3)] })
    expect(buttons()).toHaveLength(2)
  })

  it('shows an eligible plan outside the amount range of its entry as not eligible', async () => {
    await renderPlans({ plans: [plan(2), plan(3, 50000, 200000), plan(4)] })
    expect(buttons()).toHaveLength(3)
    const [two, three, four] = buttons()
    expect(three.classList.contains('alma-payment-plans-not-eligible-option')).toBe(true)
    expect(three.getAttribute('aria-disabled')).toBe('true')
    expect(two.classList.contains('alma-payment-plans-not-eligible-option')).toBe(false)
    expect(four.classList.contains('alma-payment-plans-not-eligible-option')).toBe(false)
  })

  it('behaves as if missing for null', async () => {
    await renderPlans({ plans: null }, allEligible)
    expect(labels()).not.toContain(messages('en')['payment-plan-strings.pay.now.button'])
    expect(buttons().length).toBeGreaterThan(0)
  })
})

describe('PaymentPlans merchant_covers_all_fees', () => {
  it('adds nothing to the request body', async () => {
    // The option is spelled merchantCoversAllFees. Master ignores the snake_case spelling of
    // documentation.md. This records it as it is. LIT-06 covers merchantCoversAllFees.
    const api = await renderPlans({ merchant_covers_all_fees: true })
    expect(api.calls).toHaveLength(1)
    expect(api.calls[0].body).not.toHaveProperty('merchant_covers_all_fees')
  })
})

describe('PaymentPlans cards', () => {
  it('shows the card logos of the modal in order, without duplicates', async () => {
    await openModalFromPlans({ cards: ['visa', 'cb', 'visa'] })
    expect(cardLogos()).toEqual(['card-logo-visa', 'card-logo-cb'])
  })

  it('has no card logos element without cards', async () => {
    await openModalFromPlans({})
    expect(document.querySelector('[data-testid="card-logos"]')).toBeNull()
  })

  it('has none for null', async () => {
    await openModalFromPlans({ cards: null })
    expect(document.querySelector('[data-testid="card-logos"]')).toBeNull()
  })
})

describe('Modal locale', () => {
  const closeLabel = () =>
    document.querySelector('[data-testid="modal-close-button"]')?.getAttribute('aria-label')

  it('defaults to en', async () => {
    await openStandaloneModal({})
    expect(closeLabel()).toBe(messages('en')['accessibility.close-button.aria-label'])
  })

  it('uses French for fr', async () => {
    await openStandaloneModal({ locale: 'fr' })
    expect(closeLabel()).toBe(messages('fr')['accessibility.close-button.aria-label'])
  })
})

describe('Modal cards', () => {
  it('shows the card logos in order, without duplicates', async () => {
    await openStandaloneModal({ cards: ['visa', 'cb', 'visa'] })
    expect(cardLogos()).toEqual(['card-logo-visa', 'card-logo-cb'])
  })

  it('has no card logos element without cards, or with null', async () => {
    await openStandaloneModal({})
    expect(document.querySelector('[data-testid="card-logos"]')).toBeNull()
    await openStandaloneModal({ cards: null })
    expect(document.querySelector('[data-testid="card-logos"]')).toBeNull()
  })
})

describe('Modal plans', () => {
  const planTabs = () =>
    document.querySelectorAll('.alma-eligibility-modal-eligibility-options button')

  const payNow = messages('en')['payment-plan-strings.pay.now.button']
  const texts = () => Array.from(planTabs()).map((button) => button.textContent)

  it('hides the pay-now plan without plans, and for null', async () => {
    await openStandaloneModal({}, allEligible)
    expect(planTabs().length).toBeGreaterThan(0)
    expect(texts()).not.toContain(payNow)
    await openStandaloneModal({ plans: null }, allEligible)
    expect(planTabs().length).toBeGreaterThan(0)
    expect(texts()).not.toContain(payNow)
  })

  it('shows the pay-now plan when plans has an entry for it', async () => {
    await openStandaloneModal({ plans: [plan(1), ...plans2x3x4x] }, allEligible)
    expect(texts()[0]).toBe(payNow)
  })

  it('shows only the plans that have an entry', async () => {
    await openStandaloneModal({ plans: [plan(2), plan(3)] })
    expect(planTabs()).toHaveLength(2)
  })
})

// These two come last. Master throws in the middle of a render for a null locale, and a render that
// stops half way can leave the Preact queue of a later test in a bad state.
describe('null locale', () => {
  it('throws a TypeError from add() for PaymentPlans', () => {
    // Master applies the default `en` only to undefined, and null reaches the catalogue lookup.
    // This records it as it is.
    mockEligibilityApi({ json: threePlans })
    expect(() => add(Alma.Widgets.PaymentPlans, { locale: null })).toThrow(TypeError)
  })

  it('throws a TypeError from open() for Modal', () => {
    mockEligibilityApi({ json: threePlans })
    const handle = add(Alma.Widgets.Modal, { locale: null }) as { open: () => void }
    expect(() => handle.open()).toThrow(TypeError)
  })
})
