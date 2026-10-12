import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { cacheKey } from './support/cache-key'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import { closeButton, MERCHANT_ID, tick, useFakeClock, waitFor } from './support/page'

const threePlans = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/eligible-2x-3x-4x.json'), 'utf8'),
)

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
  document.body.innerHTML =
    '<div id="fr"></div><div id="de"></div><div id="en"></div><div id="it"></div>'
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>.
afterEach(async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
})

type Handle = { open: () => void; close: (event: Event) => void }

const at = (selector: string) => document.querySelector(selector) as HTMLElement
const textAt = (selector: string) => at(selector).textContent ?? ''
const optionsAt = (selector: string) => at(selector).querySelectorAll('[role="option"]')
const activeAt = (selector: string) =>
  at(selector).querySelector('.alma-payment-plans-active-option')?.textContent

const addPlans = (
  locale: string,
  id = locale,
  merchantId = MERCHANT_ID,
  mode = Alma.ApiMode.TEST,
) =>
  Alma.Widgets.initialize(merchantId, mode).add(Alma.Widgets.PaymentPlans, {
    container: `#${id}`,
    purchaseAmount: 45000,
    locale,
  })

const addModal = (locale = 'it') =>
  Alma.Widgets.initialize(MERCHANT_ID, Alma.ApiMode.TEST).add(Alma.Widgets.Modal, {
    container: '#it',
    purchaseAmount: 45000,
    locale,
  }) as Handle

const idCounts = () => {
  const counts: Record<string, number> = {}
  document.querySelectorAll('[id]').forEach(({ id }) => {
    counts[id] = (counts[id] ?? 0) + 1
  })
  return counts
}

const sessionKeys = () =>
  Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index))

const renderThreeWidgets = async () => {
  const api = mockEligibilityApi({ json: threePlans })
  ;['fr', 'de', 'en'].forEach((locale) => addPlans(locale))
  await waitFor(
    () => ['#fr', '#de', '#en'].every((selector) => optionsAt(selector).length === 3),
    'the three widgets',
  )
  return api
}

describe('three PaymentPlans and a modal on one page', () => {
  it('gives each widget its own catalogue and number format', async () => {
    await renderThreeWidgets()
    const modal = addModal()
    modal.open()
    await waitFor(
      () => document.querySelector('.ReactModalPortal [role="dialog"]') !== null,
      'the modal',
    )
    await tick(500)

    expect(textAt('#fr')).toContain('Options de paiement disponibles')
    expect(textAt('#fr')).toMatch(/2 x 225,00\s€/)
    expect(textAt('#de')).toContain('Verfügbare Zahlungsoptionen')
    expect(textAt('#de')).toMatch(/2 x 225,00\s€/)
    expect(textAt('#en')).toContain('Available payment options')
    expect(textAt('#en')).toContain('2 x €225.00')

    const portal = textAt('.ReactModalPortal')
    expect(portal).toContain('Opzioni di pagamento disponibili')
    expect(portal).toMatch(/225,00\s€/)
    // Each widget keeps its own language.
    expect(textAt('#fr')).not.toContain('Available payment options')
    expect(textAt('#en')).not.toContain('Options de paiement')
  })

  it('sends three requests, writes one cache entry and sends none when the modal opens', async () => {
    const api = await renderThreeWidgets()
    expect(api.calls).toHaveLength(3)
    expect(sessionKeys()).toEqual([
      cacheKey({
        domain: 'https://api.sandbox.getalma.eu',
        merchantId: MERCHANT_ID,
        purchaseAmount: 45000,
      }),
    ])

    addModal().open()
    await waitFor(
      () => document.querySelector('.ReactModalPortal [role="dialog"]') !== null,
      'the modal',
    )
    await tick(500)

    expect(api.calls).toHaveLength(3)
    expect(sessionKeys()).toHaveLength(1)
  })

  // The widgets share their IDs until 5.x gives each one a shadow root. This records the duplicates
  // as they are. `payment-plans-title` and `payment-info-title` also appear in the open modal.
  it('records the duplicate IDs of the page', async () => {
    await renderThreeWidgets()
    const before = idCounts()
    expect(before['alma-widget-payment-plans-main-container']).toBe(3)
    expect(before['payment-plans-title']).toBe(3)
    expect(before['payment-info-title']).toBe(3)
    expect(before['payment-info-text']).toBe(3)

    addModal().open()
    await waitFor(
      () => document.querySelector('.ReactModalPortal [role="dialog"]') !== null,
      'the modal',
    )
    await tick(500)

    const after = idCounts()
    expect(after['alma-widget-payment-plans-main-container']).toBe(3)
    expect(after['payment-plans-title']).toBe(4)
    expect(after['payment-info-title']).toBe(4)
    expect(after['payment-info-text']).toBe(3)
    expect(after['alma-widget-modal-main-container']).toBe(1)
    expect(after['modal-title']).toBe(1)
  })
})

describe('emptying one container', () => {
  it('leaves the other widgets rendering and cycling', async () => {
    await renderThreeWidgets()
    at('#fr').replaceChildren()

    // The active plan of each widget, each time it changes, while the clock runs for 12 s.
    const seen: Record<string, string[]> = { '#de': [], '#en': [] }
    for (let elapsed = 0; elapsed < 12000; elapsed += 100) {
      Object.entries(seen).forEach(([selector, labels]) => {
        const label = activeAt(selector)
        if (label && labels[labels.length - 1] !== label) labels.push(label)
      })
      // eslint-disable-next-line no-await-in-loop
      await tick(100)
    }

    expect(at('#fr').children).toHaveLength(0)
    expect(optionsAt('#de')).toHaveLength(3)
    expect(optionsAt('#en')).toHaveLength(3)
    expect(seen['#de'].length).toBeGreaterThan(1)
    expect(seen['#en'].length).toBeGreaterThan(1)
  })
})

describe('two initialize() calls', () => {
  it('send their own Authorization header and domain', async () => {
    const api = mockEligibilityApi({ json: threePlans })
    addPlans('fr', 'fr', 'merchant_a', Alma.ApiMode.TEST)
    addPlans('en', 'en', 'merchant_b', Alma.ApiMode.LIVE)
    await waitFor(() => api.calls.length === 2, 'the two requests')

    const byHeader = Object.fromEntries(
      api.calls.map((call) => [call.headers.authorization, call.url]),
    )
    expect(byHeader).toEqual({
      'Alma-Merchant-Auth merchant_a': 'https://api.sandbox.getalma.eu/v2/payments/eligibility',
      'Alma-Merchant-Auth merchant_b': 'https://api.getalma.eu/v2/payments/eligibility',
    })
    await waitFor(
      () => optionsAt('#fr').length === 3 && optionsAt('#en').length === 3,
      'both widgets',
    )
    expect(sessionKeys()).toHaveLength(2)
  })
})
