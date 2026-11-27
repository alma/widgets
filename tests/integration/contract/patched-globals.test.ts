import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { typeOf, withEscapes } from './support/escaped-errors'
import { loadUmdInNewWindow } from './support/load-bundle'
import {
  addWidget,
  closeButton,
  modalDialog,
  planButtons,
  tick,
  useFakeClock,
} from './support/page'

const fixture = (path: string) => readFileSync(resolve(__dirname, 'fixtures', path), 'utf8')

const fourPlans = JSON.parse(fixture('eligibility/eligible-4x-2x-10x-credit-3x.json'))

// Magento 1 storefronts load Prototype.js before the widget. It adds methods to the built-in
// prototypes and replaces Array.from with $A, which returns an empty array for a Set. Run in the
// test's own window, it would break Vitest, so the page gets a window of its own.
let page: ReturnType<typeof loadUmdInNewWindow>
beforeAll(() => {
  page = loadUmdInNewWindow([fixture('vendor/prototype-1.7.3.js')])
})

useFakeClock()

// jsdom doesn't implement window.scroll, which the modal calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// A modal that a test leaves open stays mounted, and setup.ts only empties the test's window.
afterEach(async () => {
  closeButton(page.window.document)?.click()
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

const pagePlanButtons = () =>
  planButtons(page.window.document.querySelector('#alma-widget') ?? page.window.document)

const isModalOpen = () =>
  modalDialog(page.window.document) !== null && closeButton(page.window.document) !== null

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

  it('renders PaymentPlans', async () => {
    const { result, errors, escaped } = await observe(async () => {
      const recorded = await renderPlans()
      return { recorded, plans: pagePlanButtons().length }
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result.recorded.calls.map(({ rawBody }) => rawBody)).toEqual([BODY])
    expect(result.plans).toBe(4)
  })

  it('opens the modal from PaymentPlans', async () => {
    const { result, errors, escaped } = await observe(async () => {
      await renderPlans()
      pagePlanButtons()[1].click()
      await tick(500)
      return isModalOpen()
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result).toBe(true)
  })

  it('opens the standalone modal', async () => {
    const { result, errors, escaped } = await observe(async () => {
      const recorded = await openStandaloneModal()
      return { recorded, open: isModalOpen() }
    })

    expect({ errors, escaped }).toEqual({ errors: [], escaped: [] })
    expect(result.recorded.calls.map(({ rawBody }) => rawBody)).toEqual([BODY])
    expect(result.open).toBe(true)
  })
})
