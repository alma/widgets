import { screen } from '@testing-library/dom'
import { http, HttpResponse } from 'msw'
import type { MockInstance } from 'vitest'

import type { ConfigPlan } from '@/domain/plans.types'
import { ApiMode } from '@/public-api/public-api.const'
import { mockButtonPlans } from '@/test/fixtures/plans'
import { ELIGIBILITY_ENDPOINT } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { useFakeMatchMedia } from '@/test/utils/match-media'
import { TEST_MERCHANT_ID } from '@/test/utils/mount-widget'
import { closeModalOf } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'
import {
  AlmaEligibilityModal,
  type AlmaEligibilityModalProperties,
} from '@/widgets/eligibility-modal/eligibility-modal.element'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'

const FROZEN =
  'Frozen: another bundle of the widget on the same page may have defined the element, and this bundle sets these properties on it. Never add, remove, rename or retype one.'

const portals = () => document.querySelectorAll('.ReactModalPortal')

const appendModal = (properties: Partial<AlmaEligibilityModalProperties> = {}) => {
  const host = document.createElement('alma-eligibility-modal')
  Object.assign(host, {
    purchaseAmount: 45000,
    apiData: { domain: ApiMode.TEST, merchantId: TEST_MERCHANT_ID },
    locale: 'fr',
    ...properties,
  })
  const container = document.createElement('div')
  document.body.append(container)
  container.append(host)
  return host
}

describe('AlmaEligibilityModal', () => {
  beforeEach(() => {
    server.use(http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.json(mockButtonPlans)))
  })

  describe('properties', () => {
    it('should keep the frozen properties', () => {
      const names = [...AlmaEligibilityModal.elementProperties]
        .filter(([, options]) => !options.state)
        .map(([name]) => name)
        .sort()

      expect(names, FROZEN).toEqual([
        'apiData',
        'cards',
        'configPlans',
        'customerBillingCountry',
        'customerShippingCountry',
        'locale',
        'merchantCoversAllFees',
        'onClose',
        'purchaseAmount',
      ])
    })

    // npm run typecheck fails on a retyped property.
    it('should keep the frozen property types', () => {
      expectTypeOf<AlmaEligibilityModalProperties>().toEqualTypeOf<{
        purchaseAmount: number
        apiData?: { domain: string; merchantId: string }
        configPlans?: ConfigPlan[]
        customerBillingCountry?: string
        customerShippingCountry?: string
        merchantCoversAllFees?: boolean
        cards?: Card[]
        locale: string
        onClose?: (event: MouseEvent | KeyboardEvent) => void
      }>()
    })

    it("should default the locale to 'en'", () => {
      expect(new AlmaEligibilityModal().locale).toBe('en')
    })
  })

  describe('rendering', () => {
    it('should render nothing in its container and the modal in <body>', async () => {
      const host = appendModal()

      await screen.findByText('M+1')

      expect(host.childElementCount).toBe(0)
      expect(portals()).toHaveLength(1)
      expect(portals()[0].parentElement).toBe(document.body)
    })

    it('should show the loader until the plans arrive', async () => {
      appendModal()

      expect(screen.getByRole('status')).toContainElement(screen.getByTestId('loader'))
      await screen.findByText('M+1')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('layout', () => {
    const media = useFakeMatchMedia([desktopMediaQuery])

    it('should follow the 800 px query', async () => {
      appendModal()
      await screen.findByText('M+1')
      expect(screen.getByTestId('modal-container')).toHaveClass(
        'alma-eligibility-modal-desktop-modal',
      )

      media.setMatches(desktopMediaQuery, false)

      await vi.waitFor(() =>
        expect(screen.getByTestId('modal-container')).toHaveClass(
          'alma-eligibility-modal-mobile-modal',
        ),
      )
    })

    it('should stop listening to the query once removed', () => {
      const host = appendModal()

      host.remove()

      expect(media.listenerCount(desktopMediaQuery)).toBe(0)
    })
  })

  describe('closing', () => {
    it('should close the portal a microtask after the host is removed', async () => {
      const host = appendModal()

      host.remove()
      expect(portals()).toHaveLength(1)
      await Promise.resolve()

      expect(portals()).toHaveLength(0)
    })

    it('should keep the portal open when the host is removed and put back in the same task', async () => {
      const host = appendModal()
      const container = host.parentElement as HTMLElement

      container.remove()
      document.body.append(container)
      await Promise.resolve()

      expect(portals()).toHaveLength(1)
    })

    it('should close the portal at once through closeModalOf()', () => {
      const host = appendModal()

      host.remove()
      closeModalOf(host)

      expect(portals()).toHaveLength(0)
    })

    it('should keep the portal open when the host moves', async () => {
      const host = appendModal()
      const elsewhere = document.createElement('section')
      document.body.append(elsewhere)

      elsewhere.append(host)
      await Promise.resolve()

      expect(portals()).toHaveLength(1)
    })

    it('should call onClose once with the added event members', async () => {
      const onClose = vi.fn()
      appendModal({ onClose })
      const button = await screen.findByTestId('modal-close-button')

      button.click()

      expect(onClose).toHaveBeenCalledOnce()
      const [event] = onClose.mock.calls[0]
      expect(event).toBeInstanceOf(MouseEvent)
      expect(event.nativeEvent).toBe(event)
      expect(event.isDefaultPrevented()).toBe(false)
    })
  })

  describe.each([['fr_FR'], [null]])('with the locale %s', (locale) => {
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should throw nothing, open no portal and warn once', () => {
      expect(() => appendModal({ locale: locale as string })).not.toThrow()

      expect(portals()).toHaveLength(0)
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][0]).toMatch(/^\[Alma widgets\] /)
    })

    it('should open, and send its request, once a valid locale arrives', async () => {
      const request = vi.fn(() => HttpResponse.json(mockButtonPlans))
      server.use(http.post(ELIGIBILITY_ENDPOINT, request))
      const host = appendModal({ locale: locale as string })

      host.locale = 'fr'
      await screen.findByText('M+1')

      expect(portals()).toHaveLength(1)
      expect(request).toHaveBeenCalledOnce()
    })

    it('should send no request', async () => {
      const fetch = vi.spyOn(window, 'fetch')

      appendModal({ locale: locale as string })
      // A valid locale has sent its request once the microtasks have run.
      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      expect(fetch).not.toHaveBeenCalled()
    })
  })
})
