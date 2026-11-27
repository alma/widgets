import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
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
import { eligibilityPending, eligibilityPlans } from '@/test/msw/eligibility-handlers'
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

// 2x, 3x and 4x, then 10x not eligible.
const PLANS_WITH_INELIGIBLE_LAST = [
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XIneligiblePlan,
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

const mount = (plans: EligibilityPlan[] = PLANS_WITH_INELIGIBLE_LAST) =>
  renderWithPlans(plans, { purchaseAmount: 45000, transitionDelay: -1 })

const getContainer = () => document.querySelector(TEST_CONTAINER)!

const keyDown = (element: Element, key: string) => fireEvent.keyDown(element, { key })

const infoLine = () => document.getElementById('payment-info-text') as HTMLElement

const getEligiblePlans = () =>
  screen.getAllByRole('option').filter((plan) => plan.getAttribute('aria-disabled') !== 'true')

describe('PaymentPlan Accessibility Tests', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  // The modal's own markup is checked in the eligibility-modal tests. This checks the widget
  // that stays on the page, so axe scans the container only. The next test turns nested-interactive back on.
  it('should not have accessibility violations in the widget while the modal is open', async () => {
    await render()

    screen.getByRole('button', { name: KNOW_MORE_NAME }).click()
    await screen.findByTestId('modal-close-button')

    expect(
      await axe(getContainer(), { rules: { 'nested-interactive': { enabled: false } } }),
    ).toHaveNoViolations()
  })

  describe('axe on each state', () => {
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
      ['an ineligible plan after the eligible ones', () => mount()],
      ['one plan', () => renderWithPlans([mockP3XEligiblePlanWithFees])],
      ['no eligible plan', () => renderWithPlans(NO_ELIGIBLE_PLAN)],
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

      it('should move the focus and the selection to the next and previous eligible plans without wrapping', async () => {
        const { host } = await mount(PLANS_WITH_INELIGIBLE_IN_THE_MIDDLE)
        const [first, , last] = screen.getAllByRole('option')
        first.focus()

        expect(keyDown(first, 'ArrowLeft')).toBe(false)
        expect(first).toHaveFocus()
        expect(keyDown(first, 'ArrowRight')).toBe(false)
        expect(last).toHaveFocus()
        await (host as AlmaPaymentPlans).updateComplete
        expect(last).toHaveAttribute('aria-selected', 'true')
        expect(keyDown(last, 'ArrowRight')).toBe(false)
        expect(last).toHaveFocus()
        keyDown(last, 'ArrowLeft')
        expect(first).toHaveFocus()
        await (host as AlmaPaymentPlans).updateComplete
        expect(first).toHaveAttribute('aria-selected', 'true')
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
    })
  })

  describe('clickable info line', () => {
    const mountWithConfigPlans = async () => {
      server.use(eligibilityPlans(mockButtonPlans))
      await mountWidget('PaymentPlans', {
        purchaseAmount: 40000,
        plans: [
          {
            installmentsCount: 1,
            minAmount: 100,
            maxAmount: 100000,
          },
          {
            installmentsCount: 2,
            minAmount: 100,
            maxAmount: 100000,
          },
          {
            installmentsCount: 1,
            deferredDays: 30,
            minAmount: 100,
            maxAmount: 100000,
          },
          {
            installmentsCount: 3,
            minAmount: 100,
            maxAmount: 100000,
          },
          {
            installmentsCount: 10,
            minAmount: 100,
            maxAmount: 100000,
          },
        ],
      })
      await screen.findByTestId('widget-container')
    }

    it('should make the info line a button for a credit plan', async () => {
      await mountWithConfigPlans()

      await userEvent.hover(screen.getByText('10x'))

      expect(infoLine()).toHaveAttribute('role', 'button')
    })

    it('should not make the info line a button for a non-deferred P1X plan', async () => {
      await mountWithConfigPlans()

      await userEvent.hover(screen.getByText('Payer maintenant'))

      expect(infoLine()).not.toHaveAttribute('role', 'button')
    })

    it('should not be clickable when the current plan is not eligible', async () => {
      const { host } = await mount()
      const info = document.getElementById('payment-info-text') as HTMLElement
      expect(info).toHaveAttribute('role', 'button')

      fireEvent.mouseEnter(screen.getAllByRole('option')[3])
      await (host as AlmaPaymentPlans).updateComplete

      expect(screen.getAllByRole('option')[3]).toHaveAttribute('aria-selected', 'true')
      expect(info).not.toHaveAttribute('role')
    })
  })

  describe('several widgets on one page', () => {
    const addContainer = (id: string) => {
      const container = document.createElement('div')
      container.id = id
      document.body.append(container)
      return `#${id}`
    }

    it('should render the regions and headings of each widget', async () => {
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

      expect(screen.getAllByRole('region').length).toBeGreaterThanOrEqual(4)
      expect(screen.getAllByRole('heading').length).toBeGreaterThanOrEqual(4)
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

    it('should send the animation control instructions to the announcer when animation is active', async () => {
      const announce = spyOnAnnounce()
      await render({ transitionDelay: 5000 })

      vi.advanceTimersByTime(2000)

      expect(instructionsCalls(announce)).toEqual([[expect.any(String), 2000]])
    })
  })
})
