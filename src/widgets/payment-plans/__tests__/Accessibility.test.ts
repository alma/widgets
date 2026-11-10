import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import type { RequestHandler } from 'msw'
import { axe } from 'vitest-axe'

import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { eligibilityError, eligibilityPending, eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  mockButtonPlans,
  mockP10XEligiblePlan,
  mockP10XIneligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures'
import { mountWidget, TEST_CONTAINER } from '@/test/mount-widget'
import { server } from '@/test/msw-server'
import { AnnounceController } from '@/widgets/payment-plans/controllers/announce.controller'
import type { AlmaPaymentPlans } from '@/widgets/payment-plans/payment-plans.element'

type Options = Omit<PaymentPlanWidgetOptions, 'container'>

const KNOW_MORE_NAME = 'Ouvrir les options de paiement Alma pour en savoir plus'

const NESTED_INTERACTIVE_ON = { rules: { 'nested-interactive': { enabled: true } } }

// Sorted as 2x, 4x, 10x: the ineligible plan sits between two eligible ones.
const PLANS_WITH_INELIGIBLE_IN_THE_MIDDLE = [
  mockP2XEligiblePlan,
  mockP4XIneligiblePlan,
  mockP10XEligiblePlan,
]

// Both out of the purchase amount range, so both show grayed out.
const NO_ELIGIBLE_PLAN = [mockP4XIneligiblePlan, mockP10XIneligiblePlan]

const PAY_LATER_3X_4X = [
  mockPayLaterOneMonthEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
]

const render = async (options: Partial<Options> = {}) => {
  const mounted = await mountWidget('PaymentPlans', { purchaseAmount: 40000, ...options })
  await screen.findByTestId('widget-container')
  return mounted
}

const renderWithPlans = async (plans: EligibilityPlan[], options: Partial<Options> = {}) => {
  server.use(eligibilityPlans(plans))
  return render(options)
}

const getContainer = () => document.querySelector(TEST_CONTAINER)!

const getEligiblePlans = () =>
  screen.getAllByRole('option').filter((plan) => plan.getAttribute('aria-disabled') !== 'true')

const getSelectedPlan = () =>
  screen.getAllByRole('option').find((plan) => plan.getAttribute('aria-selected') === 'true')

// fireEvent returns false when a listener called preventDefault().
const isPrevented = (element: Element, key: string) =>
  !fireEvent.keyDown(element, { key, bubbles: true, cancelable: true })

describe('PaymentPlan Accessibility Tests', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('should not have any accessibility violations', async () => {
    await render()

    expect(await axe(getContainer())).toHaveNoViolations()
  })

  it.todo('should not have accessibility violations when modal is open')

  it('should not have nested-interactive violation', async () => {
    await render()

    const results = await axe(getContainer(), NESTED_INTERACTIVE_ON)

    expect(results.violations.filter(({ id }) => id === 'nested-interactive')).toHaveLength(0)
  })

  describe('axe on each state', () => {
    const settled = async (handler: RequestHandler, options: Partial<Options>) => {
      server.use(handler)
      const mounted = await mountWidget('PaymentPlans', { purchaseAmount: 40000, ...options })
      // The request settles without rendering the widget.
      await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument())
      return mounted
    }

    it.each<[string, () => Promise<unknown>]>([
      [
        'loading',
        async () => {
          server.use(eligibilityPending())
          await mountWidget('PaymentPlans', { purchaseAmount: 40000 })
          expect(screen.getByTestId('loader')).toBeInTheDocument()
        },
      ],
      ['several plans', () => renderWithPlans(mockButtonPlans)],
      ['one plan', () => renderWithPlans([mockP3XEligiblePlanWithFees])],
      ['no eligible plan', () => renderWithPlans(NO_ELIGIBLE_PLAN)],
      [
        'hideIfNotEligible with no eligible plan',
        () => settled(eligibilityPlans(NO_ELIGIBLE_PLAN), { hideIfNotEligible: true }),
      ],
      ['a failed request', () => settled(eligibilityError(), {})],
      ['monochrome: false', () => renderWithPlans(mockButtonPlans, { monochrome: false })],
      ['hideBorder: true', () => renderWithPlans(mockButtonPlans, { hideBorder: true })],
      [
        'a clickable info line',
        async () => {
          await renderWithPlans(mockButtonPlans, { suggestedPaymentPlan: 10 })
          expect(document.getElementById('payment-info-text')).toHaveAttribute('role', 'button')
        },
      ],
    ])('has no violation with %s', async (_state, setup) => {
      await setup()

      expect(await axe(getContainer(), NESTED_INTERACTIVE_ON)).toHaveNoViolations()
    })

    // So the axe runs above check an empty container, not a widget still loading.
    it.each<[string, () => RequestHandler, Partial<Options>]>([
      [
        'hideIfNotEligible with no eligible plan',
        () => eligibilityPlans(NO_ELIGIBLE_PLAN),
        { hideIfNotEligible: true },
      ],
      ['a failed request', () => eligibilityError(), {}],
    ])('renders nothing with %s', async (_state, handler, options) => {
      const { host } = await settled(handler(), options)

      expect(host).toBeEmptyDOMElement()
    })
  })

  describe('AnnounceText functionality', () => {
    it('should have an alert region for screen reader announcements', async () => {
      await renderWithPlans([mockP3XEligiblePlanWithFees], { purchaseAmount: 100000 })

      const alertRegion = screen.getByRole('alert')
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive')
      expect(alertRegion).toHaveClass('announceText')
    })

    it('should announce plan changes when hovering over different plans', async () => {
      await renderWithPlans(PAY_LATER_3X_4X, { purchaseAmount: 100000 })
      const alertRegion = screen.getByRole('alert')

      await userEvent.hover(screen.getByRole('option', { name: /3x/i }))
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x'))

      await userEvent.hover(screen.getByRole('option', { name: /4x/i }))
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 4x'))
    })

    it('should announce "Payer en différé" for pay later plans', async () => {
      await renderWithPlans(PAY_LATER_3X_4X.slice(0, 2), { purchaseAmount: 100000 })
      const alertRegion = screen.getByRole('alert')

      await userEvent.hover(screen.getByRole('option', { name: /3x/i }))
      await userEvent.hover(
        screen.getByRole('option', { name: /Option de paiement Payer en différé : 1 mois/i }),
      )

      await waitFor(() =>
        expect(alertRegion).toHaveTextContent('Plan sélectionné : Payer en différé : 1 mois'),
      )
    })

    it('should announce plan changes when using keyboard navigation', async () => {
      await renderWithPlans(PAY_LATER_3X_4X, { purchaseAmount: 100000 })
      const alertRegion = screen.getByRole('alert')

      // Not the first plan, which the first render already announces.
      screen.getByRole('option', { name: /3x/i }).focus()
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x'))

      await userEvent.keyboard('{ArrowRight}')
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 4x'))
    })

    it('should not show alert region when status is not SUCCESS', async () => {
      server.use(eligibilityPending())
      await mountWidget('PaymentPlans', { purchaseAmount: 100000 })

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should not show alert region when status is FAILED', async () => {
      server.use(eligibilityError())
      await mountWidget('PaymentPlans', { purchaseAmount: 100000 })
      await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument())

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should announce plan changes when clicking on plans', async () => {
      await renderWithPlans(PAY_LATER_3X_4X.slice(0, 2), { purchaseAmount: 100000 })
      const alertRegion = screen.getByRole('alert')

      await userEvent.click(screen.getByRole('option', { name: /3x/i }))

      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x'))
    })

    it('should clear announcements after a timeout', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        const { host } = await renderWithPlans(PAY_LATER_3X_4X, {
          purchaseAmount: 100000,
          transitionDelay: -1,
        })
        const element = host as AlmaPaymentPlans
        const alertRegion = screen.getByRole('alert')
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

        // waitFor would time out on the fake timers, so each step awaits the render instead.
        await user.hover(screen.getByRole('option', { name: /3x/i }))
        await element.updateComplete
        expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x')

        vi.advanceTimersByTime(999)
        await element.updateComplete
        expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x')

        vi.advanceTimersByTime(1)
        await element.updateComplete
        expect(alertRegion).toBeEmptyDOMElement()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('keyboard navigation', () => {
    describe('Tab order', () => {
      it('reaches the know-more button, then each eligible plan, skipping the ineligible ones', async () => {
        await renderWithPlans(PLANS_WITH_INELIGIBLE_IN_THE_MIDDLE, { purchaseAmount: 45000 })
        const user = userEvent.setup()

        await user.tab()
        expect(screen.getByRole('button', { name: KNOW_MORE_NAME })).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('option', { name: /\b2x/ })).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('option', { name: /10x/ })).toHaveFocus()
        // 10x makes the info line clickable.
        await user.tab()
        expect(document.getElementById('payment-info-text')).toHaveFocus()
      })

      it('reaches the info line after the plans when it is clickable', async () => {
        await renderWithPlans(mockButtonPlans, { suggestedPaymentPlan: 10 })
        const user = userEvent.setup()
        const eligiblePlans = getEligiblePlans()

        await user.tab()
        expect(screen.getByRole('button', { name: KNOW_MORE_NAME })).toHaveFocus()
        for (const plan of eligiblePlans) {
          // Each Tab moves on from the focus of the one before.
          // eslint-disable-next-line no-await-in-loop
          await user.tab()
          expect(plan).toHaveFocus()
        }
        // The last plan, 10x, makes the info line clickable.
        await user.tab()
        expect(document.getElementById('payment-info-text')).toHaveFocus()
      })
    })

    describe('arrow, Home and End keys', () => {
      it('moves focus and the selection to the next and previous eligible plan', async () => {
        await renderWithPlans(PLANS_WITH_INELIGIBLE_IN_THE_MIDDLE, { purchaseAmount: 45000 })
        const user = userEvent.setup()
        const [first, last] = getEligiblePlans()

        first.focus()
        await user.keyboard('{ArrowRight}')
        expect(last).toHaveFocus()
        expect(last).toHaveAttribute('aria-selected', 'true')

        await user.keyboard('{ArrowLeft}')
        expect(first).toHaveFocus()
        expect(first).toHaveAttribute('aria-selected', 'true')
      })

      it('stops at the ends', async () => {
        await renderWithPlans(mockButtonPlans)
        const user = userEvent.setup()
        const eligiblePlans = getEligiblePlans()
        const first = eligiblePlans[0]
        const last = eligiblePlans[eligiblePlans.length - 1]

        first.focus()
        await user.keyboard('{ArrowLeft}')
        expect(first).toHaveFocus()
        expect(getSelectedPlan()).toBe(first)

        last.focus()
        await user.keyboard('{ArrowRight}')
        expect(last).toHaveFocus()
        expect(getSelectedPlan()).toBe(last)
      })

      it('reaches the first and last eligible plans with Home and End', async () => {
        await renderWithPlans(mockButtonPlans)
        const user = userEvent.setup()
        const eligiblePlans = getEligiblePlans()

        eligiblePlans[1].focus()
        await user.keyboard('{Home}')
        expect(eligiblePlans[0]).toHaveFocus()
        expect(eligiblePlans[0]).toHaveAttribute('aria-selected', 'true')

        await user.keyboard('{End}')
        expect(eligiblePlans[eligiblePlans.length - 1]).toHaveFocus()
        expect(eligiblePlans[eligiblePlans.length - 1]).toHaveAttribute('aria-selected', 'true')
      })

      it.each(['ArrowLeft', 'ArrowRight', 'Home', 'End'])(
        'calls preventDefault for %s on an eligible plan',
        async (key) => {
          await renderWithPlans(mockButtonPlans)
          const plan = getEligiblePlans()[1]
          plan.focus()

          expect(isPrevented(plan, key)).toBe(true)
        },
      )

      it.each(['ArrowLeft', 'ArrowRight', 'Home', 'End'])(
        'does nothing for %s on an ineligible plan',
        async (key) => {
          const { host } = await renderWithPlans(PLANS_WITH_INELIGIBLE_IN_THE_MIDDLE, {
            purchaseAmount: 45000,
            transitionDelay: -1,
          })
          const ineligible = screen.getByRole('option', { name: /4x/ })
          const selectedBefore = getSelectedPlan()
          ineligible.focus()

          expect(isPrevented(ineligible, key)).toBe(false)
          await (host as AlmaPaymentPlans).updateComplete
          expect(ineligible).toHaveFocus()
          expect(getSelectedPlan()).toBe(selectedBefore)
        },
      )

      it('stops the cycling after a keyboard move', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        try {
          const { host } = await renderWithPlans(mockButtonPlans, { transitionDelay: 1000 })
          const eligiblePlans = getEligiblePlans()

          // No focus before the key, which would stop the cycle on its own.
          fireEvent.keyDown(eligiblePlans[0], { key: 'ArrowRight' })
          await (host as AlmaPaymentPlans).updateComplete
          expect(eligiblePlans[1]).toHaveAttribute('aria-selected', 'true')

          // Blur resumes a cycle that only a hover stopped.
          eligiblePlans[1].blur()
          vi.advanceTimersByTime(5000)
          await (host as AlmaPaymentPlans).updateComplete

          expect(eligiblePlans[1]).toHaveAttribute('aria-selected', 'true')
        } finally {
          vi.useRealTimers()
        }
      })
    })

    describe('Enter and Space', () => {
      it.each(['Enter', ' '])('call preventDefault for %j on the know-more button', async (key) => {
        await render()
        const button = screen.getByRole('button', { name: KNOW_MORE_NAME })
        button.focus()

        expect(isPrevented(button, key)).toBe(true)
      })

      it.each(['Enter', ' '])(
        'call preventDefault for %j on the clickable info line',
        async (key) => {
          await render({ suggestedPaymentPlan: 10 })
          const infoLine = document.getElementById('payment-info-text')!
          expect(infoLine).toHaveAttribute('role', 'button')
          infoLine.focus()

          expect(isPrevented(infoLine, key)).toBe(true)
        },
      )
    })
  })

  describe('Animation Control Tests', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // The instructions have their own announcer, which no element renders.
    const spyOnAnnounce = () => vi.spyOn(AnnounceController.prototype, 'announce')

    const instructionsCalls = (announce: ReturnType<typeof spyOnAnnounce>) =>
      announce.mock.calls.filter(([text]) => text.includes('Animation automatique'))

    it('should announce animation control instructions when animation is active', async () => {
      const announce = spyOnAnnounce()
      await render({ transitionDelay: 5000 })

      vi.advanceTimersByTime(2000)

      expect(instructionsCalls(announce)).toEqual([[expect.any(String), 2000]])
    })

    it('should not announce animation control instructions when animation is disabled', async () => {
      const announce = spyOnAnnounce()
      await render({ transitionDelay: -1 })

      vi.advanceTimersByTime(2000)

      expect(instructionsCalls(announce)).toHaveLength(0)
    })
  })
})
