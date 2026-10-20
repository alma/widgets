import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'

const allEligible = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/all-eligible.json'), 'utf8'),
)

type Bundle = ReturnType<typeof loadUmd>
type Closable = { open: () => void; close: (event: unknown) => void }
type ReactLikeEvent = Event & {
  persist: unknown
  isPropagationStopped: unknown
  isDefaultPrevented: unknown
  nativeEvent: unknown
}

let Alma: Bundle
beforeAll(() => {
  Alma = loadUmd()
})

const addTo = (widget: string, options: Record<string, unknown> = {}) => {
  document.body.innerHTML = '<div id="alma-widget"></div><button id="opener"></button>'
  const widgets = Alma.Widgets.initialize('merchant_contract_test', Alma.ApiMode.TEST)
  return widgets.add(widget, { container: '#alma-widget', purchaseAmount: 45000, ...options })
}

const closeButton = () => document.querySelector('[data-testid="modal-close-button"]')

describe('window.Alma', () => {
  it('has the keys Widgets, Utils and ApiMode in that order, and the Module tag', () => {
    expect(Object.keys(Alma)).toEqual(['Widgets', 'Utils', 'ApiMode'])
    expect(Object.prototype.toString.call(Alma)).toBe('[object Module]')
  })
})

describe('ApiMode', () => {
  it('has the two API URLs', () => {
    expect(Object.keys(Alma.ApiMode).sort()).toEqual(['LIVE', 'TEST'])
    expect(Alma.ApiMode.LIVE).toBe('https://api.getalma.eu')
    expect(Alma.ApiMode.TEST).toBe('https://api.sandbox.getalma.eu')
  })
})

describe('Widgets', () => {
  it('has initialize and the two widget names', () => {
    expect(Alma.Widgets.initialize).toBeInstanceOf(Function)
    expect(Alma.Widgets.PaymentPlans).toBe('PaymentPlans')
    expect(Alma.Widgets.Modal).toBe('Modal')
  })

  it('initialize() returns an object whose only key is add', () => {
    const widgets = Alma.Widgets.initialize('merchant_contract_test', Alma.ApiMode.TEST)
    expect(Object.keys(widgets)).toEqual(['add'])
  })
})

describe('Utils', () => {
  it('priceToCents rounds to the nearest cent', () => {
    expect(Alma.Utils.priceToCents(450)).toBe(45000)
    expect(Alma.Utils.priceToCents(19.99)).toBe(1999)
    expect(Alma.Utils.priceToCents(1.005)).toBe(100)
  })

  it('priceFromCents divides by 100', () => {
    expect(Alma.Utils.priceFromCents(12345)).toBe(123.45)
    expect(Alma.Utils.priceFromCents(12300)).toBe(123)
    expect(Alma.Utils.priceFromCents(5)).toBe(0.05)
  })

  it('formatCents drops trailing zeros and uses a comma', () => {
    expect(Alma.Utils.formatCents(12345)).toBe('123,45')
    expect(Alma.Utils.formatCents(12340)).toBe('123,4')
    // Master gives '123', not '123,00'. This records it as it is.
    expect(Alma.Utils.formatCents(12300)).toBe('123')
    expect(Alma.Utils.formatCents(5)).toBe('0,05')
  })
})

describe('add() return values', () => {
  it('returns undefined for PaymentPlans', () => {
    mockEligibilityApi({ json: allEligible })
    expect(addTo(Alma.Widgets.PaymentPlans)).toBeUndefined()
  })

  it('returns a handle with only open and close for Modal', () => {
    mockEligibilityApi({ json: allEligible })
    const handle = addTo(Alma.Widgets.Modal) as Closable
    expect(Object.keys(handle).sort()).toEqual(['close', 'open'])
    expect(handle.open).toBeInstanceOf(Function)
    expect(handle.close).toBeInstanceOf(Function)
  })

  it('returns the same handle for Modal when the container matches nothing', () => {
    mockEligibilityApi({ json: allEligible })
    const handle = addTo(Alma.Widgets.Modal, { container: '#missing' }) as Closable
    expect(Object.keys(handle).sort()).toEqual(['close', 'open'])
    expect(handle.open).toBeInstanceOf(Function)
    expect(handle.close).toBeInstanceOf(Function)
  })

  it('returns undefined for an unknown widget, and removes the widget of that container', async () => {
    mockEligibilityApi({ json: allEligible })
    const container = () => document.querySelector('#alma-widget') as HTMLElement
    addTo(Alma.Widgets.PaymentPlans)
    await vi.waitFor(() =>
      expect(container().querySelector('[data-testid="widget-container"]')).not.toBeNull(),
    )

    const widgets = Alma.Widgets.initialize('merchant_contract_test', Alma.ApiMode.TEST)
    const result = widgets.add('Unknown', { container: '#alma-widget' })

    expect(result).toBeUndefined()
    // Master unmounts the existing widget even for a name it doesn't know. This records it as it is.
    await vi.waitFor(() => expect(container().children).toHaveLength(0))
  })
})

describe('callback events', () => {
  const expectReactLikeEvent = (event: ReactLikeEvent) => {
    expect(event.type).toBe('click')
    expect(event.persist).toBeInstanceOf(Function)
    expect(event.isPropagationStopped).toBeInstanceOf(Function)
    expect(event.isDefaultPrevented).toBeInstanceOf(Function)
    expect(event.nativeEvent).toBe(event)
  }

  it('onClose gets a click event with the React members from a standalone modal', async () => {
    mockEligibilityApi({ json: allEligible })
    const onClose = vi.fn()
    const handle = addTo(Alma.Widgets.Modal, { onClose }) as Closable
    handle.open()

    await vi.waitFor(() => expect(closeButton()).not.toBeNull())
    ;(closeButton() as HTMLElement).click()

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expectReactLikeEvent(onClose.mock.calls[0][0])
  })

  it('onModalClose gets the same event from a modal opened by a plan button', async () => {
    mockEligibilityApi({ json: allEligible })
    const onModalClose = vi.fn()
    addTo(Alma.Widgets.PaymentPlans, { onModalClose })

    const planButton = await vi.waitFor(() => {
      const button = document.querySelector('#alma-widget button')
      expect(button).not.toBeNull()
      return button as HTMLElement
    })
    planButton.click()

    await vi.waitFor(() => expect(closeButton()).not.toBeNull())
    ;(closeButton() as HTMLElement).click()

    await vi.waitFor(() => expect(onModalClose).toHaveBeenCalledTimes(1))
    expectReactLikeEvent(onModalClose.mock.calls[0][0])
  })
})
