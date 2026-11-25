import { screen } from '@testing-library/dom'
import { http, HttpResponse } from 'msw'

import { ApiMode, Widgets } from '@/index'
import type { ModalHandle } from '@/public-api/modal-handle'
import type { ModalOptions } from '@/public-api/public-api.types'
import { mockButtonPlans } from '@/test/fixtures/plans'
import { ELIGIBILITY_ENDPOINT } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { useListenerSpies } from '@/test/utils/listener-spies'
import { TEST_CONTAINER, TEST_MERCHANT_ID } from '@/test/utils/mount-widget'

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

describe('the add(Modal) handle', () => {
  let container: HTMLElement

  beforeEach(() => {
    server.use(http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.json(mockButtonPlans)))
    container = document.createElement('div')
    container.id = TEST_CONTAINER.slice(1)
    container.innerHTML = '<p>merchant content</p>'
    document.body.innerHTML = '<button id="open-modal" type="button">Open</button>'
    document.body.append(container)
  })

  describe('open()', () => {
    it('should put only the host in the container, and the modal in the portal', async () => {
      addModal().open()
      await whenOpen()

      expect([...container.children]).toEqual([...modalHosts()])
      expect(portals()[0]).toContainElement(screen.getByTestId('modal-close-button'))
    })
  })

  describe('close(event)', () => {
    it('should call onClose once for the close button, with the added event members', async () => {
      const onClose = vi.fn()
      addModal({ onClose }).open()
      await whenOpen()

      screen.getByTestId('modal-close-button').click()

      expect(portals()).toHaveLength(0)
      expect(onClose).toHaveBeenCalledOnce()
      const [event] = onClose.mock.calls[0]
      expect(event.type).toBe('click')
      expect(event.persist).toBeInstanceOf(Function)
      expect(event.isPropagationStopped).toBeInstanceOf(Function)
      expect(event.isDefaultPrevented).toBeInstanceOf(Function)
      expect(event.nativeEvent).toBe(event)
    })
  })

  describe('clickableSelector', () => {
    it('should open the modal on a click', async () => {
      addModal()

      ;(document.querySelector('#open-modal') as HTMLButtonElement).click()
      await whenOpen()

      expect(portals()).toHaveLength(1)
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
  })

  describe('leaks', () => {
    const spies = useListenerSpies()

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should leave no window, document, body or media query listener and no timer after three open and close cycles', () => {
      vi.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'requestAnimationFrame',
          'cancelAnimationFrame',
        ],
      })
      const handle = addModal()
      const openAndClose = () => {
        handle.open()
        expect(portals()).toHaveLength(1)
        handle.close(new MouseEvent('click'))
        expect(portals()).toHaveLength(0)
      }

      openAndClose()
      openAndClose()
      openAndClose()

      expect(spies.attached()).toEqual({})
      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
