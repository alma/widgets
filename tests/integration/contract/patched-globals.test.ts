import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { outlineToText, widgetOutline } from './support/dom'
import { typeOf, withEscapes } from './support/escaped-errors'
import { loadUmdInNewWindow } from './support/load-bundle'
import { addWidget, tick, useFakeClock } from './support/page'

const fixture = (path: string) => readFileSync(resolve(__dirname, 'fixtures', path), 'utf8')

const fourPlans = JSON.parse(fixture('eligibility/eligible-4x-2x-10x-credit-3x.json'))

const golden = (name: string) => fixture(`golden/dom/${name}.txt`)

// Magento 1 storefronts load Prototype.js before the widget. It adds methods to the built-in
// prototypes and replaces Array.from with $A, which returns an empty array for a Set. Run in the
// test's own window, it would break Vitest, so the page gets a window of its own.
let page: ReturnType<typeof loadUmdInNewWindow>
beforeAll(() => {
  page = loadUmdInNewWindow([fixture('vendor/prototype-1.7.3.js')])
})

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

const $ = (selector: string) => page.window.document.querySelector<HTMLElement>(selector)

// A modal that a test leaves open stays mounted, and setup.ts only empties the test's window.
afterEach(async () => {
  $('[data-testid="modal-close-button"]')?.click()
  await tick(1000)
  page.window.document.body.replaceChildren()
})

type Handle = { open: () => void }
type Options = Record<string, unknown>

// A merchant's options come from the page, so their arrays carry Prototype's enumerable methods.
const add = (widget: string, options: Options) =>
  addWidget(page.Alma, widget, page.window.eval(`(${JSON.stringify(options)})`) as Options, {
    doc: page.window.document,
  })

const outline = () => `${outlineToText(widgetOutline($('#alma-widget'), page.window.document))}\n`

/**
 * Runs a scenario and records the console errors and the escaped errors, the page's window `error`
 * events included. Every console.error counts, whatever logs it, because Prototype.js could break
 * a library inside the bundle.
 */
const observe = async <T>(scenario: () => Promise<T>) => {
  const error = vi.spyOn(console, 'error')
  const pageErrors: string[] = []
  const onPageError = (event: ErrorEvent) => {
    pageErrors.push(typeOf(event.error ?? event))
  }
  page.window.addEventListener('error', onPageError)
  try {
    const { result, escaped } = await withEscapes(scenario)
    return { result, errors: error.mock.calls, escaped: [...escaped, ...pageErrors] }
  } finally {
    page.window.removeEventListener('error', onPageError)
    error.mockRestore()
  }
}

const renderPlans = async (options: Options = {}) => {
  const api = mockEligibilityApi({ json: fourPlans })
  add(page.Alma.Widgets.PaymentPlans, options)
  await tick(1000)
  return api
}

const openStandaloneModal = async (options: Options = {}) => {
  const api = mockEligibilityApi({ json: fourPlans })
  ;(add(page.Alma.Widgets.Modal, options) as Handle).open()
  await tick(500)
  return api
}

const BODY = '{"purchase_amount":45000,"billing_address":null,"shipping_address":null}'

describe('a page with Prototype.js 1.7.3', () => {
  it('has the patched Array.from', () => {
    expect(page.window.eval('Array.from === $A && Array.from(new Set([1])).length')).toBe(0)
  })

  it('renders PaymentPlans as without it', async () => {
    const { result, errors, escaped } = await observe(async () => {
      const recorded = await renderPlans()
      return { recorded, outline: outline() }
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result.recorded.calls.map(({ rawBody }) => rawBody)).toEqual([BODY])
    expect(result.outline).toBe(golden('payment-plans-several-plans'))
  })

  it('opens the modal from PaymentPlans as without it', async () => {
    const { result, errors, escaped } = await observe(async () => {
      await renderPlans()
      page.window.document.querySelectorAll<HTMLElement>('[role="option"]')[1].click()
      await tick(500)
      return outline()
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result).toBe(golden('payment-plans-modal-open-mobile'))
  })

  it('opens the standalone modal as without it', async () => {
    const { result, errors, escaped } = await observe(async () => {
      const recorded = await openStandaloneModal()
      return { recorded, outline: outline() }
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result.recorded.calls.map(({ rawBody }) => rawBody)).toEqual([BODY])
    expect(result.outline).toBe(golden('modal-success-mobile'))
  })

  // Master deduplicates the cards with Array.from(new Set(cards)), which $A turns into an empty
  // array. This records what master renders here: the logos element, empty.
  it('renders the card logos as master does', async () => {
    const { errors, escaped } = await observe(() =>
      openStandaloneModal({ cards: ['visa', 'cb', 'visa'] }),
    )

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect($('[data-testid="card-logos"]')?.children).toHaveLength(0)
  })
})
