import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import type { HttpHandler } from 'msw'
import { axe, configureAxe } from 'vitest-axe'

import { ApiMode } from '@/public-api/public-api.const'
import {
  configPlans,
  mockButtonPlans,
  mockP10XIneligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures/plans'
import {
  eligibilityError,
  eligibilityPending,
  eligibilityPlans,
} from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { useFakeMatchMedia } from '@/test/utils/match-media'
import { mountWidget, TEST_MERCHANT_ID } from '@/test/utils/mount-widget'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'
import type { AlmaEligibilityModalProperties } from '@/widgets/eligibility-modal/eligibility-modal.element'

// Two regions take their name from payment-schedule-title: the scheduleArea div and the Schedule
// region inside it. Merchants select the modal's DOM, so the test turns the rule off instead.
const axeWithPlans = configureAxe({ rules: { 'landmark-unique': { enabled: false } } })

const modalPortal = (): HTMLElement => {
  const portal = document.querySelector<HTMLElement>('.ReactModalPortal')
  if (!portal) throw new Error('The modal is not open')
  return portal
}

const openModal = async () => {
  const { handle } = await mountWidget('Modal', {
    clickableSelector: '',
    purchaseAmount: 45000,
    plans: configPlans,
  })
  handle?.open()
}

const showSchedule = () => screen.findByTestId('modal-installments-element')

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
  { layout: 'desktop', matching: [desktopMediaQuery] },
  { layout: 'mobile', matching: [] },
] as const)('standalone modal at the $layout layout', ({ matching }) => {
  useFakeMatchMedia([...matching])

  it.each(STATES)('should have no axe violation: $name', async ({ respond, show, showsPlans }) => {
    server.use(respond())
    await openModal()
    await show()

    const results = await (showsPlans ? axeWithPlans : axe)(modalPortal())
    expect(results).toHaveNoViolations()
  })
})

describe('AlmaEligibilityModal', () => {
  it('should put the loader in a status region until the plans arrive', async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    appendModal()

    expect(screen.getByRole('status')).toContainElement(screen.getByTestId('loader'))
    await screen.findByText('M+1')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
