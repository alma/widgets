import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import type { RequestHandler } from 'msw'
import { axe } from 'vitest-axe'

import type { EligibilityPlan } from '@/domain/plans.types'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import {
  mockButtonPlans,
  mockP10XEligiblePlan,
  mockP10XIneligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import {
  eligibilityError,
  eligibilityPending,
  eligibilityPlans,
} from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget, TEST_CONTAINER } from '@/test/utils/mount-widget'
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

describe('PaymentPlan Accessibility Tests', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  // Checks the container only, which the modal's portal sits outside of.
  // The next test turns nested-interactive back on.
  it('should not have accessibility violations when modal is open', async () => {
    await render()

    screen.getByRole('button', { name: KNOW_MORE_NAME }).click()
    await screen.findByTestId('modal-close-button')

    expect(
      await axe(getContainer(), { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations()
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
  })

  describe('AnnounceText functionality', () => {
    it('should announce plan changes when hovering over different plans', async () => {
      await renderWithPlans(PAY_LATER_3X_4X, { purchaseAmount: 100000 })
      const alertRegion = screen.getByRole('alert')

      await userEvent.hover(screen.getByRole('option', { name: /3x/i }))
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 3x'))

      await userEvent.hover(screen.getByRole('option', { name: /4x/i }))
      await waitFor(() => expect(alertRegion).toHaveTextContent('Plan sélectionné : 4x'))
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
    })

    describe('arrow, Home and End keys', () => {
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
  })
})
