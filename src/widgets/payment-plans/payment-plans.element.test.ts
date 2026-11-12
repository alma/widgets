import { fireEvent, screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { axe } from 'vitest-axe'

import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import type { ConfigPlan } from '@/domain/plans/plans.types'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { createIntl } from '@/shared/i18n/create-intl'
import type { Locale } from '@/shared/i18n/i18n.const'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import {
  ELIGIBILITY_ENDPOINT,
  eligibilityError,
  eligibilityPlans,
} from '@/test/eligibilityHandlers'
import {
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockP10XIneligiblePlan,
} from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'
import { getPlanDescription } from '@/widgets/common/plan-text'
import {
  AlmaPaymentPlans,
  type AlmaPaymentPlansProperties,
} from '@/widgets/payment-plans/payment-plans.element'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'

const FROZEN = 'The element properties are frozen for 4.x: never add, remove, rename or retype one.'

// Internal @state() fields are in elementProperties too.
const publicProperties = () =>
  [...AlmaPaymentPlans.elementProperties].filter(([, options]) => !options.state)

// The typecheck fails on a retyped property.
type FrozenProperties = {
  purchaseAmount: number
  apiData?: { domain: string; merchantId: string }
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
  hideIfNotEligible?: boolean
  monochrome?: boolean
  suggestedPaymentPlan?: number | number[]
  cards?: Card[]
  hideBorder: boolean
  onModalClose?: (event: MouseEvent | KeyboardEvent) => void
  locale: string
}

describe('AlmaPaymentPlans', () => {
  it("should keep master's properties", () => {
    expect(
      publicProperties()
        .map(([name]) => name)
        .sort(),
      FROZEN,
    ).toEqual([
      'apiData',
      'cards',
      'configPlans',
      'customerBillingCountry',
      'customerShippingCountry',
      'hideBorder',
      'hideIfNotEligible',
      'locale',
      'merchantCoversAllFees',
      'monochrome',
      'onModalClose',
      'purchaseAmount',
      'suggestedPaymentPlan',
      'transitionDelay',
    ])
  })

  it("should keep master's property types", () => {
    expectTypeOf<AlmaPaymentPlansProperties>().toEqualTypeOf<FrozenProperties>()
    expectTypeOf<Pick<AlmaPaymentPlans, keyof FrozenProperties>>().toEqualTypeOf<FrozenProperties>()
  })

  it('should take every property without an attribute', () => {
    const options = publicProperties().map(([, propertyOptions]) => propertyOptions)

    expect(
      options.every(({ attribute }) => attribute === false),
      FROZEN,
    ).toBe(true)
  })

  it("should keep master's defaults", () => {
    const element = new AlmaPaymentPlans()

    expect({ hideBorder: element.hideBorder, locale: element.locale }).toEqual({
      hideBorder: false,
      locale: 'en',
    })
  })
})

describe('AlmaPaymentPlans behaviour', () => {
  // 2x, 3x and 4x, then 10x not eligible.
  const plansWithIneligibleLast = [
    mockP2XEligiblePlan,
    mockP3XEligiblePlanWithFees,
    mockP4XEligiblePlanWithFees,
    mockP10XIneligiblePlan,
  ]

  const mount = async (
    plans: EligibilityPlan[] = plansWithIneligibleLast,
    options: Partial<PaymentPlanWidgetOptions> = {},
  ) => {
    server.use(eligibilityPlans(plans))
    const mounted = await mountWidget('PaymentPlans', {
      purchaseAmount: 45000,
      transitionDelay: -1,
      ...options,
    })
    await screen.findByTestId('widget-container')
    return mounted
  }

  const keyDown = (element: Element, key: string) => fireEvent.keyDown(element, { key })

  describe('invalid options', () => {
    it.each(['fr_FR', null])(
      'should render nothing and warn once for the locale %s',
      async (locale) => {
        server.use(eligibilityPlans(plansWithIneligibleLast))
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const { host } = await mountWidget('PaymentPlans', {
          purchaseAmount: 45000,
          locale: locale as unknown as Locale,
        })
        await vi.waitFor(() => expect(sessionStorage.length).toBe(1))
        await (host as AlmaPaymentPlans).updateComplete

        expect(host?.children).toHaveLength(0)
        expect(warn).toHaveBeenCalledOnce()
        expect(warn.mock.calls[0][0]).toMatch(/^\[Alma widgets\] /)
      },
    )

    it('should render an empty info line and warn once for an eligible plan without payment_plan', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await mount([
        { ...mockP3XEligiblePlanWithFees, payment_plan: undefined } as unknown as EligibilityPlan,
      ])

      expect(document.getElementById('payment-info-text')).toHaveTextContent('')
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][0]).toMatch(/^\[Alma widgets\] /)
    })
  })

  describe('hidden states', () => {
    it('should render nothing when the request fails', async () => {
      server.use(eligibilityError())

      const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 45000 })
      await vi.waitFor(() => expect(screen.queryByTestId('loader')).toBeNull())

      expect(host?.children).toHaveLength(0)
    })

    it('should render nothing with hideIfNotEligible and no eligible plan', async () => {
      server.use(eligibilityPlans([mockP4XIneligiblePlan, mockP10XIneligiblePlan]))

      const { host } = await mountWidget('PaymentPlans', {
        purchaseAmount: 45000,
        hideIfNotEligible: true,
      })
      await vi.waitFor(() => expect(screen.queryByTestId('loader')).toBeNull())

      expect(host?.children).toHaveLength(0)
    })
  })

  describe('keyboard', () => {
    it('should move the focus to the next and previous eligible plans without wrapping', async () => {
      await mount()
      const [first, second, third] = screen.getAllByRole('option')
      first.focus()

      expect(keyDown(first, 'ArrowLeft')).toBe(false)
      expect(first).toHaveFocus()
      expect(keyDown(first, 'ArrowRight')).toBe(false)
      expect(second).toHaveFocus()
      keyDown(second, 'ArrowRight')
      expect(keyDown(third, 'ArrowRight')).toBe(false)
      expect(third).toHaveFocus()
    })

    it('should move the focus to the first and last eligible plans with Home and End', async () => {
      await mount()
      const [first, second, third] = screen.getAllByRole('option')

      expect(keyDown(second, 'End')).toBe(false)
      expect(third).toHaveFocus()
      expect(keyDown(third, 'Home')).toBe(false)
      expect(first).toHaveFocus()
    })

    it('should ignore the keys on a plan that is not eligible, and other keys', async () => {
      await mount()
      const options = screen.getAllByRole('option')

      expect(keyDown(options[3], 'ArrowLeft')).toBe(true)
      expect(keyDown(options[0], 'a')).toBe(true)
    })

    it('should prevent the default of Enter and Space on the know-more button', async () => {
      await mount()
      const knowMore = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      expect(keyDown(knowMore, 'Enter')).toBe(false)
      expect(keyDown(knowMore, ' ')).toBe(false)
      expect(keyDown(knowMore, 'a')).toBe(true)
    })

    it('should prevent the default of Enter and Space on the clickable info line', async () => {
      await mount()
      const info = document.getElementById('payment-info-text') as HTMLElement

      expect(info).toHaveAttribute('role', 'button')
      expect(keyDown(info, 'Enter')).toBe(false)
      expect(keyDown(info, ' ')).toBe(false)
    })
  })

  describe('clicks', () => {
    it('should highlight a clicked eligible plan and stop the click at the plan', async () => {
      await mount()
      const onPageClick = vi.fn()
      document.body.addEventListener('click', onPageClick)
      const third = screen.getAllByRole('option')[2]

      await userEvent.click(third)

      expect(third).toHaveAttribute('aria-selected', 'true')
      expect(onPageClick).not.toHaveBeenCalled()
      document.body.removeEventListener('click', onPageClick)
    })

    it('should not highlight a clicked plan that is not eligible', async () => {
      await mount()
      const last = screen.getAllByRole('option')[3]

      fireEvent.click(last)

      expect(last).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('suggested plan', () => {
    const announcement = (plan: EligibilityPlan) => {
      const intl = createIntl('fr')
      return intl.formatMessage(paymentPlansMessages.planSelectionChanged, {
        planDescription: getPlanDescription(plan, intl),
      })
    }

    it('should announce the first plan, then the suggested one, as master', async () => {
      const texts: string[] = []
      const observer = new MutationObserver(() => {
        const text = document.querySelector('[role="alert"]')?.textContent ?? ''
        if (text && texts.at(-1) !== text) texts.push(text)
      })
      observer.observe(document.body, { subtree: true, childList: true, characterData: true })

      await mount(undefined, { suggestedPaymentPlan: 4 })
      await vi.waitFor(() => expect(texts).toHaveLength(2))
      observer.disconnect()

      expect(texts).toEqual([
        announcement(mockP2XEligiblePlan),
        announcement(mockP4XEligiblePlanWithFees),
      ])
      expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('timers', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should leave no timer once removed, and cycle again once put back', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const { host } = await mount(plansWithIneligibleLast, { transitionDelay: 1000 })
      const container = host?.parentElement as HTMLElement

      host?.remove()

      expect(vi.getTimerCount()).toBe(0)

      container.append(host as HTMLElement)
      vi.advanceTimersByTime(1000)
      await (host as AlmaPaymentPlans).updateComplete

      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('should announce nothing while removed, and announce once put back', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      let respond = () => {}
      const responded = new Promise<void>((resolve) => {
        respond = resolve
      })
      server.use(
        http.post(ELIGIBILITY_ENDPOINT, async () => {
          await responded
          return HttpResponse.json(plansWithIneligibleLast)
        }),
      )
      const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 45000 })
      const element = host as AlmaPaymentPlans
      const container = element.parentElement as HTMLElement

      element.remove()
      respond()
      await vi.waitFor(() => expect(sessionStorage.length).toBe(1))
      await element.updateComplete

      expect(vi.getTimerCount()).toBe(0)

      container.append(element)

      await vi.waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Plan sélectionné'),
      )
    })

    // Each render restarts master's default 5500 ms countdown. The animation instructions clear at
    // 3500 ms, then each plan's announcement clears 1000 ms after its move.
    it("should move the highlight with master's default delay and its restarts", async () => {
      const step = 100
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      // findByTestId in mount() doesn't advance the fake timers, unlike vi.waitFor.
      const { host } = await mount(plansWithIneligibleLast, { transitionDelay: undefined })
      const selectedIndex = () =>
        screen
          .getAllByRole('option')
          .findIndex((plan) => plan.getAttribute('aria-selected') === 'true')
      const moves: number[] = []
      let selected = selectedIndex()

      for (let time = step; time <= 22000; time += step) {
        vi.advanceTimersByTime(step)
        // Each step needs the render of the one before.
        await (host as AlmaPaymentPlans).updateComplete
        if (selectedIndex() !== selected) {
          selected = selectedIndex()
          moves.push(time)
        }
      }

      expect(moves).toEqual([3500 + 5500, 9000 + 1000 + 5500, 15500 + 1000 + 5500])
    })
  })

  describe('modal', () => {
    const portals = () => document.querySelectorAll('.ReactModalPortal')
    const modalPlan = () =>
      document.querySelector('.alma-eligibility-modal-active-option')?.textContent
    const knowMore = () =>
      screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })
    const openModal = async () => {
      knowMore().click()
      await screen.findByTestId('modal-close-button')
    }

    it('should open with the plans of the widget, and send no request', async () => {
      let requests = 0
      server.use(
        http.post(ELIGIBILITY_ENDPOINT, () => {
          requests += 1
          return HttpResponse.json(plansWithIneligibleLast)
        }),
      )
      await mountWidget('PaymentPlans', { purchaseAmount: 45000, transitionDelay: -1 })
      await screen.findByTestId('widget-container')

      await openModal()

      expect(requests).toBe(1)
      expect(modalPlan()).toBe('2x')
    })

    it('should open on the first eligible plan when the current plan is not eligible', async () => {
      await mount()
      fireEvent.mouseEnter(screen.getAllByRole('option')[3])

      await openModal()

      expect(modalPlan()).toBe('2x')
    })

    it("should keep its plan when the widget's current plan changes", async () => {
      const { host } = await mount()
      await userEvent.click(screen.getAllByRole('option')[1])

      fireEvent.mouseEnter(screen.getAllByRole('option')[2])
      await (host as AlmaPaymentPlans).updateComplete

      expect(modalPlan()).toBe('3x')
    })

    it('should not open without an eligible plan, and still prevent the default', async () => {
      await mount([mockP4XIneligiblePlan, mockP10XIneligiblePlan])
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })

      knowMore().dispatchEvent(click)
      await Promise.resolve()

      expect(click.defaultPrevented).toBe(true)
      expect(portals()).toHaveLength(0)
    })

    it.each([
      ['the close button', 'click', () => screen.getByTestId('modal-close-button').click()],
      [
        'Escape',
        'keydown',
        () =>
          document
            .querySelector('#alma-widget-modal-main-container')
            ?.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }),
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
    ])(
      'should call onModalClose once for %s, with the modal still open and the React members',
      async (_name, type, close) => {
        let portalsDuringCallback: number | undefined
        const onModalClose = vi.fn(() => {
          portalsDuringCallback = portals().length
        })
        const { host } = await mount(undefined, { onModalClose })
        await openModal()

        close()
        await (host as AlmaPaymentPlans).updateComplete

        expect(onModalClose).toHaveBeenCalledOnce()
        expect(portalsDuringCallback).toBe(1)
        expect(portals()).toHaveLength(0)
        const event = (onModalClose.mock.calls[0] as unknown[])[0] as Record<string, unknown>
        expect(event.type).toBe(type)
        expect(event.persist).toBeInstanceOf(Function)
        expect(event.isPropagationStopped).toBeInstanceOf(Function)
        expect(event.isDefaultPrevented).toBeInstanceOf(Function)
        expect(event.nativeEvent).toBe(event)
      },
    )

    it('should close when onModalClose throws, and let the error reach the page', async () => {
      const error = new Error('merchant callback')
      const pageErrors: unknown[] = []
      const onPageError = (event: ErrorEvent) => {
        pageErrors.push(event.error)
        event.preventDefault()
      }
      window.addEventListener('error', onPageError)
      const { host } = await mount(undefined, {
        onModalClose: () => {
          throw error
        },
      })
      await openModal()

      screen.getByTestId('modal-close-button').click()
      await (host as AlmaPaymentPlans).updateComplete
      window.removeEventListener('error', onPageError)

      expect(pageErrors).toEqual([error])
      expect(portals()).toHaveLength(0)
    })

    it('should close at once, without onModalClose, when another add() replaces the widget', async () => {
      const onModalClose = vi.fn()
      await mount(undefined, { onModalClose })
      await openModal()

      const replaced = mountWidget('PaymentPlans', { purchaseAmount: 45000 })

      expect(portals()).toHaveLength(0)
      expect(document.body).not.toHaveClass('ReactModal__Body--open')
      expect(onModalClose).not.toHaveBeenCalled()
      await replaced
    })

    it('should close without onModalClose once the host leaves the page', async () => {
      const onModalClose = vi.fn()
      const { host } = await mount(undefined, { onModalClose })
      await openModal()

      host?.remove()
      await Promise.resolve()

      expect(portals()).toHaveLength(0)
      expect(onModalClose).not.toHaveBeenCalled()
    })

    it('should stay closed when the host comes back in a later task', async () => {
      const { host } = await mount()
      const container = host?.parentElement as HTMLElement
      await openModal()

      host?.remove()
      await Promise.resolve()
      container.append(host as AlmaPaymentPlans)
      ;(host as AlmaPaymentPlans).requestUpdate()
      await (host as AlmaPaymentPlans).updateComplete

      expect(portals()).toHaveLength(0)
    })

    it('should not update the widget when the shopper picks a plan in the modal', async () => {
      const { host } = await mount()
      await openModal()
      const update = vi.spyOn(host as AlmaPaymentPlans, 'requestUpdate')

      // Synchronous, so the announcement's clear timer can't update the host in between.
      screen.getByRole('button', { name: /3x/ }).click()

      expect(modalPlan()).toBe('3x')
      expect(update).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { host } = await mount()

      expect(await axe(host as HTMLElement)).toHaveNoViolations()
    })
  })
})
