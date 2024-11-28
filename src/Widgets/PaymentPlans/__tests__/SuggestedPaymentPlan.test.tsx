import React from 'react'

import { act, screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import { ConfigPlan } from '@/types'
import { configPlans, mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))
jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 5600

describe('PaymentPlan has suggestedPaymentPlan', () => {
  describe('as a number', () => {
    const renderPlans = (suggestedPlan: number, plans?: ConfigPlan[]) =>
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          suggestedPaymentPlan={suggestedPlan}
          configPlans={plans}
        />,
      )

    it('displays the message corresponding to the payment plan hovered', async () => {
      renderPlans(2)
      await screen.findByTestId('widget-button')
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText('2x').className).toContain('active')
    })
    it('should target the P1X and not a PayLater plan when suggested plan is 1', async () => {
      renderPlans(1, configPlans) // specify all plans explicitly to display P1X. P1X is only displayed if provided in configPlans.
      await screen.findByTestId('widget-button')
      expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
      expect(screen.getByText('Payer maintenant').className).toContain('active')
    })
  })

  describe('as an array', () => {
    const setup = async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          suggestedPaymentPlan={[3, 2]}
        />,
      )
      await screen.findByTestId('widget-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('displays the third item as selected', () => {
      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })

    it('should not rotate the active installment', () => {
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('3x').className).toContain('active')
    })
  })

  describe('as an array with first item being illegible', () => {
    const setup = async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          configPlans={[
            {
              installmentsCount: 1,
              minAmount: 5000,
              maxAmount: 20000,
            },
            {
              installmentsCount: 2,
              minAmount: 0,
              maxAmount: 0,
            },
            {
              installmentsCount: 1,
              deferredDays: 30,
              minAmount: 50000,
              maxAmount: 70000,
            },
            {
              installmentsCount: 3,
              minAmount: 5000,
              maxAmount: 50000,
            },
            {
              installmentsCount: 8,
              minAmount: 5000,
              maxAmount: 50000,
            },
          ]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          suggestedPaymentPlan={[2, 3]}
        />,
      )
      await screen.findByTestId('widget-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('displays the 3x as active (2 is illegible)', () => {
      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })
  })

  describe('with a wrong value', () => {
    const setup = async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          suggestedPaymentPlan={[20]}
        />,
      )
      await screen.findByTestId('widget-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should select the first installment', () => {
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      expect(screen.getByText('M+1').className).toContain('active')
    })
  })

  describe('with a different transitionDelay', () => {
    const setUp = async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          transitionDelay={1000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          suggestedPaymentPlan={[2]}
        />,
      )
      await screen.findByTestId('widget-button')
    }
    beforeEach(async () => {
      await setUp()
    })

    it('displays the message corresponding to the payment plan hovered', () => {
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText('2x').className).toContain('active')
      // TODO Fix this test
      act((): void => {
        jest.advanceTimersByTime(1000)
      })
      expect(screen.getByText('3x').className).toContain('active')
    })
  })
})
