import React from 'react'

import { screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import {
  mockEligibilityPaymentPlanWithIneligiblePlan,
  mockEligibilityWithGrayedOutPlan,
  mockEligibilityWithHiddenPlan,
} from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

let fetchResult: unknown = mockEligibilityPaymentPlanWithIneligiblePlan

jest.mock('utils/fetch', () => ({
  fetchFromApi: () => Promise.resolve(fetchResult),
}))

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

const apiData = { domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime())
})

afterAll(() => {
  jest.useRealTimers()
})

describe('Ineligible plan due to purchase_amount range stays grayed out', () => {
  beforeEach(() => {
    fetchResult = mockEligibilityPaymentPlanWithIneligiblePlan
  })

  it('keeps grayed-out the plan ineligible due to price range', async () => {
    render(<PaymentPlanWidget purchaseAmount={45000} configPlans={configPlans} apiData={apiData} />)
    await screen.findByTestId('widget-container')

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    // 4x is ineligible due to purchase_amount range → still shown grayed out
    expect(screen.getByText('4x')).toBeInTheDocument()
  })

  it('keeps grayed-out the plan with explicit constraints.purchase_amount', async () => {
    fetchResult = mockEligibilityWithGrayedOutPlan
    render(<PaymentPlanWidget purchaseAmount={45000} configPlans={configPlans} apiData={apiData} />)
    await screen.findByTestId('widget-container')

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    // 4x has constraints.purchase_amount → grayed out, not hidden
    expect(screen.getByText('4x')).toBeInTheDocument()
  })
})

describe('Ineligible plan due to non-purchase_amount reason is hidden', () => {
  beforeEach(() => {
    fetchResult = mockEligibilityWithHiddenPlan
  })

  it('hides the plan ineligible due to installments_count reason', async () => {
    render(<PaymentPlanWidget purchaseAmount={45000} configPlans={configPlans} apiData={apiData} />)
    await screen.findByTestId('widget-container')

    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    // 4x is ineligible due to installments_count → hidden entirely
    expect(screen.queryByText('4x')).not.toBeInTheDocument()
  })
})
