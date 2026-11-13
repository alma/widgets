import { screen } from '@testing-library/dom'
import { http, HttpResponse } from 'msw'
import type { MockInstance } from 'vitest'

import { ApiMode, Widgets } from '@/index'
import type { ModalHandle } from '@/public-api/modal-handle'
import type { ModalOptions } from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import { ELIGIBILITY_ENDPOINT } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { TEST_CONTAINER, TEST_MERCHANT_ID } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

let requests: number

const addModal = (options: Partial<ModalOptions> = {}) =>
  Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST).add(Widgets.Modal, {
    container: TEST_CONTAINER,
    clickableSelector: '#open-modal',
    purchaseAmount: 45000,
    locale: 'fr',
    ...options,
  } as ModalOptions) as ModalHandle

const portals = () => document.querySelectorAll('.ReactModalPortal')
const modalHosts = () => document.querySelectorAll('alma-eligibility-modal')
const whenOpen = () => screen.findByText('M+1')

const expectReactLikeEvent = (event: Record<string, unknown>, type: string) => {
  expect(event.type).toBe(type)
  expect(event.persist).toBeInstanceOf(Function)
  expect(event.isPropagationStopped).toBeInstanceOf(Function)
  expect(event.isDefaultPrevented).toBeInstanceOf(Function)
  expect(event.nativeEvent).toBe(event)
}

describe('the add(Modal) handle', () => {
  let container: HTMLElement

  beforeEach(() => {
    requests = 0
    server.use(
      http.post(ELIGIBILITY_ENDPOINT, () => {
        requests += 1
        return HttpResponse.json(mockButtonPlans)
      }),
    )
    container = document.createElement('div')
    container.id = TEST_CONTAINER.slice(1)
    container.innerHTML = '<p>merchant content</p>'
    document.body.innerHTML = '<button id="open-modal" type="button">Open</button>'
    document.body.append(container)
  })

  describe('open()', () => {
    it('should leave the container untouched until open()', () => {
      addModal()

      expect(container.innerHTML).toBe('<p>merchant content</p>')
      expect(portals()).toHaveLength(0)
      expect(requests).toBe(0)
    })

    it('should put only the host in the container, and the modal in the portal', async () => {
      addModal().open()
      await whenOpen()

      expect([...container.children]).toEqual([...modalHosts()])
      expect(portals()[0]).toContainElement(screen.getByTestId('modal-close-button'))
    })

    it('should create no second host and send no second request for a second open()', async () => {
      const handle = addModal()
      handle.open()
      await whenOpen()
      const [host] = modalHosts()

      handle.open()

      expect([...modalHosts()]).toEqual([host])
      expect(portals()).toHaveLength(1)
      expect(requests).toBe(1)
    })

    // Master renders into the same Preact tree, which updates the open modal in place.
    it("should update the open modal with another handle's options, with no new host or request", async () => {
      const onClose = vi.fn()
      const first = addModal({ onClose })
      addModal({ locale: Locale.en }).open()
      await screen.findByText('M+1')
      const [host] = modalHosts()

      first.open()
      await host.updateComplete
      screen.getByTestId('modal-close-button').click()

      expect(host.locale).toBe('fr')
      expect(onClose).toHaveBeenCalledOnce()
      expect(requests).toBe(1)
    })

    // fr_FR, with an underscore, is a locale that Intl rejects. fr-FR is valid.
    it("should open the modal of a host that couldn't, once another handle brings a valid locale", async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const handle = addModal()
      addModal({ locale: 'fr_FR' as ModalOptions['locale'] }).open()
      const [host] = modalHosts()

      handle.open()
      await whenOpen()

      expect([...modalHosts()]).toEqual([host])
      expect(portals()).toHaveLength(1)
      expect(requests).toBe(1)
    })

    it('should send no request for a new open() after a close, within the hour', async () => {
      const handle = addModal()
      handle.open()
      await whenOpen()
      handle.close(new MouseEvent('click'))

      handle.open()
      await whenOpen()

      expect(requests).toBe(1)
    })
  })

  describe('close(event)', () => {
    it('should remove the portal and the host before onClose, with the same event', async () => {
      const state: { portals?: number; hosts?: number } = {}
      const onClose = vi.fn(() => {
        state.portals = portals().length
        state.hosts = modalHosts().length
      })
      const handle = addModal({ onClose })
      handle.open()
      await whenOpen()
      const event = new MouseEvent('click')

      handle.close(event)

      expect(onClose).toHaveBeenCalledOnce()
      expect((onClose.mock.calls[0] as unknown[])[0]).toBe(event)
      expect(state).toEqual({ portals: 0, hosts: 0 })
    })

    it('should call onClose even when no modal is open', () => {
      const onClose = vi.fn()
      const event = new MouseEvent('click')

      addModal({ onClose }).close(event)

      expect(onClose).toHaveBeenCalledWith(event)
    })

    it("should not call onClose when the container doesn't exist", () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const onClose = vi.fn()
      const handle = addModal({ container: '#missing', onClose })

      handle.open()
      handle.close(new MouseEvent('click'))

      expect(onClose).not.toHaveBeenCalled()
      expect(portals()).toHaveLength(0)
    })

    it.each([
      ['the close button', 'click', () => screen.getByTestId('modal-close-button').click()],
      [
        'Escape',
        'keydown',
        () =>
          document.querySelector('#alma-widget-modal-main-container')?.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              bubbles: true,
            }),
          ),
      ],
      [
        'an overlay click',
        'click',
        () => {
          const overlay = document.querySelector('.ReactModal__Overlay') as Element
          ;['mousedown', 'mouseup', 'click'].forEach((type) =>
            overlay.dispatchEvent(new MouseEvent(type, { bubbles: true })),
          )
        },
      ],
    ])('should call onClose once for %s, with the React members', async (_name, type, act) => {
      const onClose = vi.fn()
      addModal({ onClose }).open()
      await whenOpen()

      act()

      expect(portals()).toHaveLength(0)
      expect(onClose).toHaveBeenCalledOnce()
      expectReactLikeEvent((onClose.mock.calls[0] as unknown[])[0] as Record<string, unknown>, type)
    })
  })

  describe('clickableSelector', () => {
    it('should open the modal on a click, without preventing the default action', async () => {
      addModal()
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })

      document.querySelector('#open-modal')?.dispatchEvent(click)
      await whenOpen()

      expect(portals()).toHaveLength(1)
      expect(click.defaultPrevented).toBe(false)
    })

    it('should keep every listener, as master does', () => {
      const button = document.querySelector('#open-modal') as HTMLButtonElement
      const add = vi.spyOn(button, 'addEventListener')
      const remove = vi.spyOn(button, 'removeEventListener')

      addModal()
      addModal()

      expect(add).toHaveBeenCalledTimes(2)
      expect(remove).not.toHaveBeenCalled()
    })

    it('should open the modal with the options of the add(Modal) whose trigger was clicked', async () => {
      document.body.insertAdjacentHTML(
        'afterbegin',
        '<button id="other" type="button">Other</button>',
      )
      const onClose = vi.fn()
      const otherOnClose = vi.fn()
      addModal({ onClose })
      addModal({ clickableSelector: '#other', onClose: otherOnClose })

      const openAndClose = async (trigger: string) => {
        ;(document.querySelector(trigger) as HTMLButtonElement).click()
        await whenOpen()
        screen.getByTestId('modal-close-button').click()
      }

      await openAndClose('#open-modal')
      expect(onClose).toHaveBeenCalledOnce()
      expect(otherOnClose).not.toHaveBeenCalled()

      await openAndClose('#other')
      expect(otherOnClose).toHaveBeenCalledOnce()
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('should keep the listener after another widget replaces the modal, as master does', async () => {
      addModal()
      Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST).add(Widgets.PaymentPlans, {
        container: TEST_CONTAINER,
        purchaseAmount: 45000,
      })

      ;(document.querySelector('#open-modal') as HTMLButtonElement).click()
      await whenOpen()

      expect([...container.children]).toEqual([...modalHosts()])
    })

    it('should warn and add nothing for an invalid selector', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => addModal({ clickableSelector: '#' })).not.toThrow()

      expect(warn).toHaveBeenCalledOnce()
    })
  })

  describe('with the locale fr_FR', () => {
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should throw nothing, open no portal and log one warning', () => {
      const handle = addModal({ locale: 'fr_FR' as ModalOptions['locale'] })

      expect(() => handle.open()).not.toThrow()

      expect(portals()).toHaveLength(0)
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][0]).toMatch(/^\[Alma widgets\] /)
    })
  })
})
