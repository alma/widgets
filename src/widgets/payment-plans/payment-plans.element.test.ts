import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import type { EligibilityPlan } from '@/domain/plans.types'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockButtonPlans,
  mockEligibilityWithHiddenPlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockP10XIneligiblePlan,
} from '@/test/fixtures/plans'
import {
  ELIGIBILITY_ENDPOINT,
  eligibilityError,
  eligibilityPlans,
} from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'
import { AlmaPaymentPlans } from '@/widgets/payment-plans/payment-plans.element'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import { getPlanDescription } from '@/widgets/payment-plans/utils/plan-description'

const FROZEN =
  'Frozen: another bundle of the widget on the same page may have defined the element, and this bundle sets these properties on it. Never add, remove, rename or retype one.'

// Internal @state() fields are in elementProperties too.
const publicProperties = () =>
  [...AlmaPaymentPlans.elementProperties].filter(([, options]) => !options.state)

describe('AlmaPaymentPlans', () => {
  it('should keep the frozen properties', () => {
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

  it('should take every property without an attribute', () => {
    const options = publicProperties().map(([, propertyOptions]) => propertyOptions)

    expect(
      options.every(({ attribute }) => attribute === false),
      FROZEN,
    ).toBe(true)
  })

  it('should keep the defaults', () => {
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

  describe('options', () => {
    it('should render in the locale it is given', async () => {
      await mount(mockButtonPlans, { locale: Locale.de })

      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText(/zu zahlen am/)).toBeInTheDocument()
      expect(screen.getByText(/\(0% Finanzierung\)/)).toBeInTheDocument()
    })

    it('should render the current plan in monochrome with monochrome: true', async () => {
      await mount(undefined, { monochrome: true })

      expect(screen.getAllByRole('option')[0]).toHaveClass('monochrome')
    })

    it('should render without border with hideBorder: true', async () => {
      await mount(mockButtonPlans, { hideBorder: true })

      expect(screen.getByTestId('widget-container')).toHaveClass('hideBorder')
    })

    it('should show only the know-more line when a credit plan is hovered', async () => {
      await mount(mockButtonPlans, { purchaseAmount: 40000 })

      await userEvent.hover(screen.getByText('10x'))

      expect(document.getElementById('payment-info-text')?.textContent?.trim()).toBe(
        'Cliquez pour en savoir plus',
      )
    })

    it('should render the plans with hideIfNotEligible when a plan is eligible', async () => {
      await mount([mockP2XEligiblePlan, mockP3XEligiblePlanWithFees, mockP4XEligiblePlanWithFees], {
        hideIfNotEligible: true,
      })

      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it.each([false, null])(
      'should render the plans that are not eligible with hideIfNotEligible: %s',
      async (hideIfNotEligible) => {
        await mount([mockP4XIneligiblePlan, mockP10XIneligiblePlan], {
          hideIfNotEligible: hideIfNotEligible as boolean,
        })

        expect(screen.getAllByRole('option')).toHaveLength(2)
      },
    )
  })

  describe('hidden states', () => {
    // The loader must show first, so an empty widget means the request finished and not that it has not rendered yet.
    const waitForLoaderToFinish = async (host: HTMLElement | null | undefined) => {
      await screen.findByTestId('loader')
      await vi.waitFor(() => expect(screen.queryByTestId('loader')).toBeNull())
      await (host as AlmaPaymentPlans).updateComplete
    }

    it('should render nothing when the request fails', async () => {
      server.use(eligibilityError())

      const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 45000 })
      await waitForLoaderToFinish(host)

      expect(host?.children).toHaveLength(0)
    })

    it('should render nothing, cache the response and warn nothing for an empty response', async () => {
      server.use(eligibilityPlans([]))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 45000 })
      await vi.waitFor(() => expect(sessionStorage.length).toBe(1))
      await (host as AlmaPaymentPlans).updateComplete

      expect(host?.children).toHaveLength(0)
      expect(warn).not.toHaveBeenCalled()
    })

    it('should render nothing with hideIfNotEligible and no eligible plan', async () => {
      server.use(eligibilityPlans([mockP4XIneligiblePlan, mockP10XIneligiblePlan]))

      const { host } = await mountWidget('PaymentPlans', {
        purchaseAmount: 45000,
        hideIfNotEligible: true,
      })
      await waitForLoaderToFinish(host)

      expect(host?.children).toHaveLength(0)
    })

    it('should render nothing when no plan is left to show', async () => {
      server.use(eligibilityPlans(mockButtonPlans))

      const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 40000, plans: [] })
      await waitForLoaderToFinish(host)

      expect(host?.children).toHaveLength(0)
    })
  })

  describe('Ineligible plan due to non-purchase_amount reason is hidden', () => {
    const configPlans = [
      {
        installmentsCount: 1,
        deferredDays: 30,
        minAmount: 5000,
        maxAmount: 70000,
      },
      {
        installmentsCount: 2,
        minAmount: 5000,
        maxAmount: 50000,
      },
      {
        installmentsCount: 4,
        minAmount: 5000,
        maxAmount: 15000,
      },
    ]

    const renderWidget = async (plans: EligibilityPlan[]) => {
      server.use(eligibilityPlans(plans))
      await mountWidget('PaymentPlans', { purchaseAmount: 45000, plans: configPlans })
      await screen.findByTestId('widget-container')
    }

    it('hides the plan ineligible due to installments_count reason', async () => {
      await renderWidget(mockEligibilityWithHiddenPlan)

      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.queryByText('4x')).not.toBeInTheDocument()
    })
  })

  describe('clicks', () => {
    it('should highlight a clicked eligible plan, open the modal and stop the click at the plan', async () => {
      await mount()
      const onPageClick = vi.fn()
      document.body.addEventListener('click', onPageClick)
      const third = screen.getAllByRole('option')[2]

      await userEvent.click(third)

      expect(third).toHaveAttribute('aria-selected', 'true')
      expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
      expect(onPageClick).not.toHaveBeenCalled()
      document.body.removeEventListener('click', onPageClick)
    })

    it('should neither select a clicked plan that is not eligible nor open the modal', async () => {
      const { host } = await mount()

      // userEvent.click hovers first, and hovering a plan selects it. This click has no hover.
      fireEvent.click(screen.getAllByRole('option')[3])
      await (host as AlmaPaymentPlans).updateComplete

      expect(screen.getAllByRole('option')[3]).toHaveAttribute('aria-selected', 'false')
      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument()
    })
  })

  describe('suggested plan', () => {
    const announcement = (plan: EligibilityPlan) => {
      const intl = createIntl('fr')
      return intl.formatMessage(paymentPlansMessages.planSelectionChanged, {
        planDescription: getPlanDescription(plan, intl),
      })
    }

    it('should announce the first plan, then the suggested one', async () => {
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

  describe('PaymentPlan has suggestedPaymentPlan', () => {
    let host: HTMLElement & { updateComplete?: Promise<boolean> }

    const renderWidget = async (options: Omit<PaymentPlanWidgetOptions, 'container'>) => {
      const mounted = await mountWidget('PaymentPlans', options)
      host = mounted.host!
      await vi.waitFor(() => screen.getByTestId('widget-container'))
    }

    const advance = async (ms: number) => {
      vi.advanceTimersByTime(ms)
      await host.updateComplete
    }

    const activePlan = () =>
      document.querySelector('.alma-payment-plans-active-option')?.textContent ?? null

    // Checks every second, since a full cycle ends on the plan it started from.
    const expectNoCycling = async (plan: string | null) => {
      for (let elapsed = 0; elapsed < 30000; elapsed += 1000) {
        await advance(1000)
        expect(activePlan()).toBe(plan)
      }
    }

    beforeEach(() => {
      server.use(eligibilityPlans(mockButtonPlans))
      // msw answers through promises, so only the timers are fake.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('as an array', () => {
      it('should not rotate the active installment', async () => {
        await renderWidget({ purchaseAmount: 40000, suggestedPaymentPlan: [3, 2] })

        expect(activePlan()).toBe('3x')

        await expectNoCycling('3x')
      })
    })

    describe('with a different transitionDelay', () => {
      it('displays the message corresponding to the payment plan hovered', async () => {
        await renderWidget({
          purchaseAmount: 40000,
          transitionDelay: 1000,
          suggestedPaymentPlan: [2],
        })

        expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
        expect(screen.getByText('2x').className).toContain('active')
        await advance(1000)
        expect(screen.getByText('3x').className).toContain('active')
      })

      it.each([0, null])(
        'should keep the suggested plan and not cycle with a transitionDelay of %s',
        async (transitionDelay) => {
          await renderWidget({
            purchaseAmount: 40000,
            suggestedPaymentPlan: 4,
            transitionDelay: transitionDelay as number,
          })
          await host.updateComplete

          expect(activePlan()).toBe('4x')
          await expectNoCycling('4x')
        },
      )
    })

    describe('as null', () => {
      it('should keep the first plan and not cycle', async () => {
        await renderWidget({
          purchaseAmount: 40000,
          suggestedPaymentPlan: null as unknown as number,
        })
        await host.updateComplete
        const firstPlan = screen.getAllByRole('option')[0].textContent

        expect(activePlan()).toBe(firstPlan)
        await expectNoCycling(firstPlan)
      })
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

    // Each render restarts the default 5500 ms countdown. The animation instructions clear at
    // 3500 ms, then each plan's announcement clears 1000 ms after its move.
    it.each([undefined, null])(
      'should move the highlight with the default delay and its restarts (transitionDelay = %s)',
      async (transitionDelay) => {
        const step = 100
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        // findByTestId in mount() doesn't advance the fake timers, unlike vi.waitFor.
        const { host } = await mount(plansWithIneligibleLast, {
          transitionDelay: transitionDelay as unknown as number,
        })
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
      },
    )
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

    it('should open on the plan the shopper hovered', async () => {
      await mount()
      await userEvent.hover(screen.getAllByRole('option')[1])

      await openModal()

      expect(modalPlan()).toBe('3x')
    })

    it('should open on the first eligible plan when the current plan is not eligible', async () => {
      await mount()
      fireEvent.mouseEnter(screen.getAllByRole('option')[3])

      await openModal()

      expect(modalPlan()).toBe('2x')
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
      'should call onModalClose once for %s, with the modal still open and the added event members',
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
  })

  describe('PaymentPlans, several widgets on one page', () => {
    const addContainer = (id: string) => {
      const container = document.createElement('div')
      container.id = id
      document.body.append(container)
      return `#${id}`
    }

    beforeEach(() => {
      server.use(eligibilityPlans(mockButtonPlans))
    })

    it('should render both widgets, with the same main container ID', async () => {
      await mountWidget('PaymentPlans', {
        purchaseAmount: 40000,
        container: addContainer('alma-widget-first'),
      })
      await mountWidget('PaymentPlans', {
        purchaseAmount: 50000,
        container: addContainer('alma-widget-second'),
      })

      // findAll resolves on the first widget, before the second one's response
      await waitFor(() => expect(screen.getAllByTestId('widget-container')).toHaveLength(2))
      const containers = screen.getAllByTestId('widget-container')

      // Known bug: both widgets get the same ID. Merchant CSS and scripts select it,
      // so only a release that may break them can fix it.
      const widgetIds = containers.map((container) => container.id)
      expect(widgetIds[0]).toBe('alma-widget-payment-plans-main-container')
      expect(widgetIds[1]).toBe('alma-widget-payment-plans-main-container')
    })

    describe('once the merchant empties one container', () => {
      afterEach(() => {
        vi.useRealTimers()
      })

      it('should keep cycling through the plans of the other widget', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const emptied = addContainer('alma-widget-emptied')
        const other = addContainer('alma-widget-other')
        await mountWidget('PaymentPlans', { purchaseAmount: 45000, container: emptied })
        await mountWidget('PaymentPlans', { purchaseAmount: 45000, container: other })
        await vi.waitFor(() => expect(screen.getAllByTestId('widget-container')).toHaveLength(2))
        const selectedIndex = () =>
          Array.from(document.querySelectorAll(`${other} [role="option"]`)).findIndex(
            (plan) => plan.getAttribute('aria-selected') === 'true',
          )
        expect(selectedIndex()).toBe(0)

        document.querySelector(emptied)?.replaceChildren()
        // The first move waits for the default delay, which restarts on each render.
        for (let time = 0; time < 20000 && selectedIndex() === 0; time += 100) {
          await vi.advanceTimersByTimeAsync(100)
        }

        expect(selectedIndex()).toBe(1)
      })
    })
  })
})
