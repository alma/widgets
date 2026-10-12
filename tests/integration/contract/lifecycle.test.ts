import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { cacheKey } from './support/cache-key'
import { it } from './support/contract-test'
import { containerChildren } from './support/dom'
import { loadUmd } from './support/load-bundle'
import {
  addAgain,
  addWidget,
  closeButton,
  container,
  MERCHANT_ID,
  planButtons,
  tick,
  useFakeClock,
  waitFor,
} from './support/page'

const threePlans = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/eligible-2x-3x-4x.json'), 'utf8'),
)

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>, and would put its
// body trap back in the next test's page. Closing it here keeps the tests apart.
afterEach(async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
})

const plansName = () => Alma.Widgets.PaymentPlans
const keyFor = (purchaseAmount: number) =>
  cacheKey({
    domain: 'https://api.sandbox.getalma.eu',
    merchantId: MERCHANT_ID,
    purchaseAmount,
  })
const sessionKeys = () =>
  Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index)).sort()

const widgetRoots = () => document.querySelectorAll('#alma-widget-payment-plans-main-container')
const portals = () => document.querySelectorAll('.ReactModalPortal')
const title = () => container().querySelector('#payment-plans-title')?.textContent

const renderPlans = async (options: Record<string, unknown> = {}) => {
  const api = mockEligibilityApi({ json: threePlans })
  addWidget(Alma, plansName(), options)
  await waitFor(() => planButtons().length > 0, 'the plan buttons')
  return api
}

const openModalFromPlans = async () => {
  planButtons()[0].click()
  await waitFor(() => closeButton() !== null, 'the modal')
  await tick(500)
}

const activeLabel = () =>
  container().querySelector('.alma-payment-plans-active-option')?.textContent ?? ''

/** The active plan, each time it changes, while the clock advances. */
const planOrder = async (ms: number, order: string[] = []) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    const label = activeLabel()
    if (label && order[order.length - 1] !== label) order.push(label)
    // eslint-disable-next-line no-await-in-loop
    await tick(100)
  }
  return order
}

describe('replacement and refresh', () => {
  it('leaves one widget with the options of the second add()', async () => {
    await renderPlans()
    const englishTitle = title()
    addAgain(Alma, plansName(), { locale: 'fr' })
    await waitFor(() => planButtons().length > 0, 'the plan buttons')

    expect(widgetRoots()).toHaveLength(1)
    expect(title()).toBeTruthy()
    expect(title()).not.toBe(englishTitle)
  })

  it('sends one request with the new amount for a second add()', async () => {
    const api = await renderPlans()
    addAgain(Alma, plansName(), { purchaseAmount: 30000 })
    await waitFor(() => api.calls.length > 1, 'the second request')
    await waitFor(() => planButtons().length > 0, 'the plan buttons')

    expect(api.calls).toHaveLength(2)
    expect((api.calls[1].body as { purchase_amount: number }).purchase_amount).toBe(30000)
    expect(widgetRoots()).toHaveLength(1)
    expect(planButtons()).toHaveLength(3)
  })

  // Master sends a request per add(), even with the same options, because the cache is only
  // written once a response arrives. The Lit build must send no more.
  it('sends a second request for the same options while the first is pending', async () => {
    const api = mockEligibilityApi({ pending: true })
    addWidget(Alma, plansName())
    await tick(500)
    addAgain(Alma, plansName())
    await tick(500)
    expect(api.calls).toHaveLength(2)

    api.release(threePlans)
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    expect(widgetRoots()).toHaveLength(1)
    expect(planButtons()).toHaveLength(3)
  })

  it('writes the cache of a request whose widget was replaced', async () => {
    const api = mockEligibilityApi({ pending: true })
    addWidget(Alma, plansName(), { purchaseAmount: 45000 })
    await tick(500)
    addAgain(Alma, plansName(), { purchaseAmount: 30000 })
    await tick(500)
    api.release(threePlans)
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    await tick(500)

    expect(sessionKeys()).toEqual([keyFor(45000), keyFor(30000)].sort())

    addAgain(Alma, plansName(), { purchaseAmount: 45000 })
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    expect(api.calls).toHaveLength(2)
  })

  it('removes a PaymentPlans widget at once for add(Modal)', async () => {
    await renderPlans()
    expect(containerChildren(container()).length).toBeGreaterThan(0)

    addAgain(Alma, Alma.Widgets.Modal)
    expect(containerChildren(container())).toHaveLength(0)
  })

  it('removes the modal and its page effects for add(PaymentPlans) over an open modal', async () => {
    await renderPlans()
    await openModalFromPlans()
    expect(portals()).toHaveLength(1)
    expect(document.body.classList.contains('ReactModal__Body--open')).toBe(true)
    expect(document.querySelectorAll('[data-react-modal-body-trap]')).toHaveLength(2)

    // Another amount, so that the cache doesn't answer.
    mockEligibilityApi({ pending: true })
    addAgain(Alma, plansName(), { purchaseAmount: 30000 })
    await tick(500)

    expect(portals()).toHaveLength(0)
    expect(document.body.classList.contains('ReactModal__Body--open')).toBe(false)
    expect(document.querySelectorAll('[data-react-modal-body-trap]')).toHaveLength(0)
    expect(planButtons()).toHaveLength(0)
    expect(container().querySelector('[data-testid="loader"]')).not.toBeNull()
  })
})

describe('external emptying', () => {
  it('leaves the container empty for 60 s after success, and a later add() sends no request', async () => {
    const api = await renderPlans()
    container().innerHTML = ''
    await tick(60000)
    expect(containerChildren(container())).toHaveLength(0)

    addAgain(Alma, plansName())
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    expect(api.calls).toHaveLength(1)
  })

  // This doesn't assert the container after the response. Master puts the announcement
  // div[role="alert"] back into the emptied container, a side effect of Preact patching a tree
  // that was removed. The Lit host stops when it leaves the DOM, so it doesn't do that.
  it('still completes the request and writes the cache after the container is emptied while loading', async () => {
    const api = mockEligibilityApi({ pending: true })
    addWidget(Alma, plansName())
    await tick(100)
    container().innerHTML = ''
    api.release(threePlans)
    await tick(5000)

    expect(sessionKeys()).toEqual([keyFor(45000)])
    addAgain(Alma, plansName())
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    expect(api.calls).toHaveLength(1)
  })

  // Not asserted: that the timers stop after the emptying. On master they keep running, and the
  // Lit host stops them.
})

describe('moves', () => {
  type When = 'loading' | 'success' | 'cycling'

  const run = async (move: boolean, when: When) => {
    sessionStorage.clear()
    const api = mockEligibilityApi({ pending: true })
    addWidget(Alma, plansName(), { transitionDelay: 1000 })
    document.body.insertAdjacentHTML('beforeend', '<section id="elsewhere"></section>')
    const moveContainer = () => document.querySelector('#elsewhere')?.appendChild(container())
    await tick(100)
    if (move && when === 'loading') moveContainer()
    api.release(threePlans)
    await waitFor(() => planButtons().length > 0, 'the plan buttons')
    if (move && when === 'success') moveContainer()
    const order: string[] = []
    // Let one change happen before the move during cycling.
    if (when === 'cycling') {
      await planOrder(3000, order)
      if (move) moveContainer()
    }
    await planOrder(when === 'cycling' ? 12000 : 3000, order)
    await tick(20000)
    return { api, order, html: container().innerHTML, state: activeLabel() }
  }

  describe.each<When>(['loading', 'success', 'cycling'])('moved while %s', (when) => {
    it('gives the same plans, one request and the same order as without the move', async () => {
      const still = await run(false, when)
      const moved = await run(true, when)

      expect(moved.api.calls).toHaveLength(1)
      expect(moved.order).toEqual(still.order)
      expect(moved.order.length).toBeGreaterThan(1)
      // During cycling, only the order and the state after the cycle count. The Lit host restarts
      // its countdown when it reconnects (LIT-34), while master's timer keeps running, so the
      // DOM at a given fake time may differ.
      expect(moved.state).toBe(still.state)
      if (when !== 'cycling') expect(moved.html).toBe(still.html)
    })
  })

  it('keeps one portal open when the container moves with the modal opened from the widget', async () => {
    await renderPlans()
    await openModalFromPlans()
    document.body.insertAdjacentHTML('beforeend', '<section id="elsewhere"></section>')
    document.querySelector('#elsewhere')?.appendChild(container())
    await tick(500)

    expect(portals()).toHaveLength(1)
    expect(closeButton()).not.toBeNull()
  })

  it('keeps one portal open when the container moves with the modal opened by add(Modal)', async () => {
    mockEligibilityApi({ json: threePlans })
    const handle = addWidget(Alma, Alma.Widgets.Modal) as { open: () => void }
    handle.open()
    await waitFor(() => closeButton() !== null, 'the modal')
    document.body.insertAdjacentHTML('beforeend', '<section id="elsewhere"></section>')
    document.querySelector('#elsewhere')?.appendChild(container())
    await tick(500)

    expect(portals()).toHaveLength(1)
    expect(closeButton()).not.toBeNull()
  })
})

describe('clickableSelector', () => {
  const addModal = (options: Record<string, unknown> = {}) =>
    addAgain(Alma, Alma.Widgets.Modal, { clickableSelector: '#btn', ...options })

  const pageWithButtons = () => {
    document.body.innerHTML =
      '<div id="alma-widget"></div><button id="btn">one</button><button id="btn">two</button>'
  }

  it('mounts nothing, and a click opens one portal with one request, without preventing the default', async () => {
    const api = mockEligibilityApi({ json: threePlans })
    pageWithButtons()
    addModal()
    await tick(500)
    expect(portals()).toHaveLength(0)
    expect(containerChildren(container())).toHaveLength(0)
    expect(api.calls).toHaveLength(0)

    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    document.querySelector('#btn')?.dispatchEvent(click)
    await waitFor(() => closeButton() !== null, 'the modal')
    await tick(500)

    expect(click.defaultPrevented).toBe(false)
    expect(portals()).toHaveLength(1)
    expect(api.calls).toHaveLength(1)
  })

  it('opens the modal from the first match only', async () => {
    mockEligibilityApi({ json: threePlans })
    pageWithButtons()
    addModal()
    ;(document.querySelectorAll('#btn')[1] as HTMLElement).click()
    await tick(500)
    expect(portals()).toHaveLength(0)
  })

  it('throws no error for a selector that matches nothing', () => {
    mockEligibilityApi({ json: threePlans })
    pageWithButtons()
    expect(() => addModal({ clickableSelector: '#nothing' })).not.toThrow()
  })

  // Not asserted: the number of requests and of listeners. Master adds a click listener on each
  // add() and never removes it, so three add() calls send three requests on one click. The Lit
  // design removes the old listener when it replaces the widget, and sends fewer.
  it('opens one portal after three add(Modal) calls, and the close button runs the last onClose only', async () => {
    mockEligibilityApi({ json: threePlans })
    pageWithButtons()
    const onClose = [vi.fn(), vi.fn(), vi.fn()]
    onClose.forEach((callback) => addModal({ onClose: callback }))
    ;(document.querySelector('#btn') as HTMLElement).click()
    await waitFor(() => closeButton() !== null, 'the modal')
    await tick(500)
    expect(portals()).toHaveLength(1)

    ;(closeButton() as HTMLElement).click()
    await waitFor(() => closeButton() === null, 'the modal to close')
    expect(onClose[2]).toHaveBeenCalledTimes(1)
    expect(onClose[0]).not.toHaveBeenCalled()
    expect(onClose[1]).not.toHaveBeenCalled()
  })

  it('stops the click of a plan button at the widget, and lets the know-more click through', async () => {
    await renderPlans()
    const onClick = vi.fn()
    container().addEventListener('click', onClick)

    planButtons()[0].click()
    await tick(500)
    expect(onClick).not.toHaveBeenCalled()
    ;(closeButton() as HTMLElement).click()
    await waitFor(() => closeButton() === null, 'the modal to close')

    ;(container().querySelector('button[aria-haspopup="dialog"]') as HTMLElement).click()
    await tick(500)
    expect(onClick).toHaveBeenCalled()
  })
})
