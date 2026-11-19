import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import {
  addWidget,
  closeButton,
  container,
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

type Handle = { open: () => void; close: (event?: unknown) => void }
type Callback = ReturnType<typeof vi.fn>

const portals = () => document.querySelectorAll('.ReactModalPortal')
const sentinels = () => document.querySelectorAll('[data-react-modal-body-trap]')
const modalContainer = () => document.querySelector('#alma-widget-modal-main-container') as Element
const overlay = () => document.querySelector('.ReactModal__Overlay') as Element

const whenOpen = async () => {
  await waitFor(() => closeButton() !== null, 'the modal')
  // The modal opens while the plans load.
  await tick(500)
}
const whenClosed = () => waitFor(() => closeButton() === null, 'the modal to close')

/** The two ways to get a modal. Each one passes its callback under another option name. */
const variants = [
  {
    name: 'onClose, from add(Modal)',
    option: 'onClose',
    open: async (callback: Callback) => {
      const api = mockEligibilityApi({ json: threePlans })
      const handle = addWidget(Alma, Alma.Widgets.Modal, { onClose: callback }) as Handle
      handle.open()
      await whenOpen()
      return { api, handle }
    },
  },
  {
    name: 'onModalClose, from a plan button',
    option: 'onModalClose',
    open: async (callback: Callback) => {
      const api = mockEligibilityApi({ json: threePlans })
      addWidget(Alma, Alma.Widgets.PaymentPlans, { onModalClose: callback })
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      planButtons()[0].click()
      await whenOpen()
      return { api, handle: undefined }
    },
  },
]

const expectReactLikeEvent = (event: Record<string, unknown>, type: string) => {
  expect(event.type).toBe(type)
  expect(event.persist).toBeInstanceOf(Function)
  expect(event.isPropagationStopped).toBeInstanceOf(Function)
  expect(event.isDefaultPrevented).toBeInstanceOf(Function)
  expect(event.nativeEvent).toBe(event)
}

describe.each(variants)('closing the modal with $name', ({ open }) => {
  it('closes with the close button and runs the callback once', async () => {
    const callback = vi.fn()
    await open(callback)
    ;(closeButton() as HTMLElement).click()
    await whenClosed()

    expect(portals()).toHaveLength(0)
    expect(callback).toHaveBeenCalledTimes(1)
    expectReactLikeEvent(callback.mock.calls[0][0], 'click')
  })

  it('closes with Escape on the modal container and runs the callback once', async () => {
    const callback = vi.fn()
    await open(callback)
    modalContainer().dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
        cancelable: true,
      }),
    )
    await whenClosed()

    expect(portals()).toHaveLength(0)
    expect(callback).toHaveBeenCalledTimes(1)
    expectReactLikeEvent(callback.mock.calls[0][0], 'keydown')
  })

  it('closes with a click on the overlay and runs the callback once', async () => {
    const callback = vi.fn()
    await open(callback)
    ;['mousedown', 'mouseup', 'click'].forEach((type) =>
      overlay().dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true })),
    )
    await whenClosed()

    expect(portals()).toHaveLength(0)
    expect(callback).toHaveBeenCalledTimes(1)
    expectReactLikeEvent(callback.mock.calls[0][0], 'click')
  })
})

describe('open() and close()', () => {
  const standalone = (options: Record<string, unknown> = {}) => {
    const api = mockEligibilityApi({ json: threePlans })
    const handle = addWidget(Alma, Alma.Widgets.Modal, options) as Handle
    return { api, handle }
  }

  it('mounts one portal, and a second open() keeps one portal and sends no request', async () => {
    const { api, handle } = standalone()
    handle.open()
    await whenOpen()
    expect(portals()).toHaveLength(1)

    handle.open()
    await tick(1000)
    expect(portals()).toHaveLength(1)
    expect(api.calls).toHaveLength(1)
  })

  // Not asserted: that the request count stays at one. The first response has not arrived, so
  // master sends a request per open(), two in total. The Lit build may send fewer.
  it('keeps one portal for two open() calls before the response', async () => {
    const api = mockEligibilityApi({ pending: true })
    const handle = addWidget(Alma, Alma.Widgets.Modal) as Handle
    handle.open()
    await tick(500)
    handle.open()
    await tick(500)
    api.release(threePlans)
    await whenOpen()

    expect(portals()).toHaveLength(1)
    expect(api.calls.length).toBeLessThanOrEqual(2)
  })

  it('passes the argument of close(obj) to onClose', async () => {
    const onClose = vi.fn()
    const { handle } = standalone({ onClose })
    handle.open()
    await whenOpen()
    const event = { marker: 'close' }
    handle.close(event)
    await whenClosed()

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0][0]).toBe(event)
  })

  it('calls onClose with undefined for close() without an argument', async () => {
    const onClose = vi.fn()
    const { handle } = standalone({ onClose })
    handle.open()
    await whenOpen()
    handle.close()
    await whenClosed()

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose.mock.calls[0]).toEqual([undefined])
  })

  // This records master as it is. close() on a modal that is closed still calls onClose. The Lit
  // build is free to skip the call, so the test only requires at most one call.
  it('calls onClose at most once for close() while the modal is closed', () => {
    const onClose = vi.fn()
    const { handle } = standalone({ onClose })
    handle.close()
    expect(onClose.mock.calls.length).toBeLessThanOrEqual(1)
  })

  it('does nothing for open() and close() when the container matches nothing', async () => {
    const onClose = vi.fn()
    const { api, handle } = standalone({ onClose, container: '#missing' })
    handle.open()
    await tick(1000)
    handle.close()
    await tick(1000)

    expect(portals()).toHaveLength(0)
    expect(api.calls).toHaveLength(0)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('leaves nothing behind after three open and close cycles', async () => {
    const onClose = vi.fn()
    const { api, handle } = standalone({ onClose })
    for (let cycle = 0; cycle < 3; cycle += 1) {
      handle.open()
      // eslint-disable-next-line no-await-in-loop
      await whenOpen()
      ;(closeButton() as HTMLElement).click()
      // eslint-disable-next-line no-await-in-loop
      await whenClosed()
    }
    await tick(1000)

    expect(portals()).toHaveLength(0)
    expect(sentinels()).toHaveLength(0)
    expect(onClose).toHaveBeenCalledTimes(3)
    expect(api.calls).toHaveLength(1)
    // Master leaves an empty style attribute on <html> and an empty class attribute on <body>
    // that had none before, so a missing or empty attribute both pass.
    expect(document.documentElement.getAttribute('style') ?? '').toBe('')
    expect(document.body.getAttribute('class') ?? '').toBe('')
    expect(container()).not.toBeNull()
  })
})
