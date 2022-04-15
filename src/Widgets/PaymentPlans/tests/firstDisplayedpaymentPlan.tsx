import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { act } from 'react-dom/test-utils'
import render from 'test'
import PaymentPlanWidget from '..'

export default function FirstDiplayedPaymentPlan(animationDuration: number): void {
  describe('as a number', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          firstDisplayedPaymentPlan={2}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })

    it('displays the message corresponding to the payment plan hovered', () => {
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText('2x').className).toContain('active')
    })
  })

  describe('as an array', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          firstDisplayedPaymentPlan={[3, 2]}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })

    it('displays the third item as selected', () => {
      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })

    it('should not rotate the active installment', () => {
      act((): void => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('3x').className).toContain('active')
    })
  })

  describe('as an array with first item being illegible', () => {
    beforeEach(async () => {
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
          firstDisplayedPaymentPlan={[2, 3]}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })

    it('displays the 3x as active (2 is illegible)', () => {
      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })
  })

  describe('with a wrong value', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          firstDisplayedPaymentPlan={[20]}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })

    it('should select the first installment', () => {
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      expect(screen.getByText('J+30').className).toContain('active')
    })
  })
  //TODO Test with delay and firstDisplayedPaymentPlan to check active moved properly
  // todo test without firstDisplayedPaymentPlan to check the default delay
}
