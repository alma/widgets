import { screen } from '@testing-library/dom'

import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  mockEligibilityPaymentPlanWithIneligiblePlan,
  mockEligibilityWithGrayedOutPlan,
  mockEligibilityWithHiddenPlan,
} from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

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

describe('Ineligible plan due to purchase_amount range stays grayed out', () => {
  it('keeps grayed-out the plan ineligible due to price range', async () => {
    await renderWidget(mockEligibilityPaymentPlanWithIneligiblePlan)

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
  })

  it('keeps grayed-out the plan with explicit constraints.purchase_amount', async () => {
    await renderWidget(mockEligibilityWithGrayedOutPlan)

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
  })
})

describe('Ineligible plan due to non-purchase_amount reason is hidden', () => {
  it('hides the plan ineligible due to installments_count reason', async () => {
    await renderWidget(mockEligibilityWithHiddenPlan)

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.queryByText('4x')).not.toBeInTheDocument()
  })
})
