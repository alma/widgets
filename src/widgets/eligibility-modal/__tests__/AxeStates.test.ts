import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import type { HttpHandler } from 'msw'
import { axe, configureAxe } from 'vitest-axe'

import { eligibilityError, eligibilityPending, eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  configPlans,
  mockP10XIneligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures'
import { useFakeMatchMedia } from '@/test/match-media'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'
import STATIC_CUSTOMISATION_CLASSES, {
  desktopMediaQuery,
} from '@/widgets/eligibility-modal/eligibility-modal.const'

// Master labels two regions with payment-schedule-title: EligibilityModal's scheduleArea div and
// the Schedule region inside it.
const axeWithPlans = configureAxe({ rules: { 'landmark-unique': { enabled: false } } })

const modalPortal = (): HTMLElement => {
  const portal = document.querySelector<HTMLElement>('.ReactModalPortal')
  if (!portal) throw new Error('The modal is not open')
  return portal
}

const showSchedule = () => screen.findByTestId('modal-installments-element')

type ModalState = {
  name: string
  respond: () => HttpHandler
  // Resolves once the modal shows the state.
  show: () => Promise<unknown>
  showsPlans: boolean
}

// The states of modal-content.stories.ts, from the plans of the request.
const STATES: ModalState[] = [
  {
    name: 'pending',
    respond: eligibilityPending,
    show: () => screen.findByRole('status'),
    showsPlans: false,
  },
  {
    name: 'several plans',
    // Without pay-now, so the first plan is deferred.
    respond: () => eligibilityPlans(mockPlansAllEligible.slice(1)),
    show: showSchedule,
    showsPlans: true,
  },
  {
    name: 'one plan',
    respond: () => eligibilityPlans([mockP3XEligiblePlanWithFees]),
    show: showSchedule,
    showsPlans: true,
  },
  {
    name: 'P1X selected',
    respond: () => eligibilityPlans(mockPlansAllEligible),
    show: showSchedule,
    showsPlans: true,
  },
  {
    name: 'credit selected',
    respond: () => eligibilityPlans(mockPlansAllEligible),
    show: async () => {
      await userEvent.click(await screen.findByText('10x'))
      return screen.findByTestId('legal-mentions')
    },
    showsPlans: true,
  },
  {
    name: 'no eligible plan',
    respond: () => eligibilityPlans([mockP4XIneligiblePlan, mockP10XIneligiblePlan]),
    show: () => screen.findByRole('alert'),
    showsPlans: false,
  },
  {
    name: 'failed',
    respond: eligibilityError,
    show: async () => {
      // The loader shows until the request fails, then the content stays empty.
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      await screen.findByRole('status')
      return vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    },
    showsPlans: false,
  },
]

describe.each([
  { layout: 'desktop', matching: [desktopMediaQuery], layoutClass: 'desktopModal' },
  { layout: 'mobile', matching: [], layoutClass: 'mobileModal' },
] as const)('standalone modal at the $layout layout', ({ matching, layoutClass }) => {
  useFakeMatchMedia([...matching])

  it.each(STATES)('should have no axe violation: $name', async ({ respond, show, showsPlans }) => {
    server.use(respond())
    const { handle } = await mountWidget('Modal', {
      clickableSelector: '',
      purchaseAmount: 45000,
      plans: configPlans,
    })
    handle?.open()
    await show()

    expect(screen.getByTestId('modal-container')).toHaveClass(
      STATIC_CUSTOMISATION_CLASSES[layoutClass],
    )
    const results = await (showsPlans ? axeWithPlans : axe)(modalPortal())
    expect(results).toHaveNoViolations()
  })
})
