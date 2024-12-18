import React from 'react'

import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockEligibilityPaymentPlanWithIneligiblePlan } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockEligibilityPaymentPlanWithIneligiblePlan,
}))

const animationDuration = 5600

describe('PaymentPlan has ineligible options from configPlans', () => {
  const setup = async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={45000}
        configPlans={[
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
          {
            installmentsCount: 8,
            minAmount: 5000,
            maxAmount: 50000,
          },
        ]}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await screen.findByTestId('widget-button')
  }
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime())
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    await setup()
  })

  it('displays only provided plans (except p1x)', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
    expect(screen.queryByText('1x')).not.toBeInTheDocument()
  })

  it('does not display plan that are not part of eligibility', () => {
    expect(screen.queryByText('8x')).not.toBeInTheDocument()
  })

  it('only iterates over active plans', async () => {
    expect(screen.getByText('450,00 € à payer le 3 juin 2022 (sans frais)')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('2 x 225,00 € (sans frais)')).toBeInTheDocument()
  })

  it('display conditions when inactive plans are hovered', async () => {
    const user = userEvent.setup({ delay: null })

    await user.hover(screen.getByText('4x'))
    expect(screen.getByText("Jusqu'à 150,00 €")).toBeInTheDocument()
  })
})

describe('PaymentPlan has ineligible options from merchant config', () => {
  const setup = async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={45000}
        configPlans={[
          {
            installmentsCount: 4,
            minAmount: 30000,
            maxAmount: 400000,
          },
          {
            installmentsCount: 10,
            minAmount: 5000,
            maxAmount: 50000,
          },
        ]}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await screen.findByTestId('widget-button')
  }
  beforeEach(async () => {
    await setup()
  })

  it('display conditions when non eligible plans are hovered', async () => {
    const user = userEvent.setup({ delay: null })

    await user.hover(screen.getByText('10x'))
    expect(screen.getByText('À partir de 900,00 €')).toBeInTheDocument()
    await user.hover(screen.getByText('4x'))
    expect(screen.getByText("Jusqu'à 200,00 €")).toBeInTheDocument()
  })
})
