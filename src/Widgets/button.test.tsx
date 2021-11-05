import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { IntlProvider } from 'react-intl'
import PaymentPlanWidget from './PaymentPlan'
jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => [
      {
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        deferred_days: 0,
        deferred_months: 1,
        eligible: true,
        installments_count: 1,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1637498000,
            purchase_amount: 45000,
            total_amount: 45000,
          },
        ],
        purchase_amount: 45000,
      },
      {
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: true,
        installments_count: 1,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 45000,
            total_amount: 45000,
          },
        ],
        purchase_amount: 45000,
      },
      {
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: true,
        installments_count: 2,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 22500,
            total_amount: 22500,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 22500,
            total_amount: 22500,
          },
        ],
        purchase_amount: 45000,
      },
      {
        customer_total_cost_amount: 135,
        customer_total_cost_bps: 30,
        deferred_days: 0,
        deferred_months: 0,
        eligible: true,
        installments_count: 3,
        payment_plan: [
          {
            customer_fee: 135,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 15000,
            total_amount: 15135,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1637498000,
            purchase_amount: 15000,
            total_amount: 15000,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1640090000,
            purchase_amount: 15000,
            total_amount: 15000,
          },
        ],
        purchase_amount: 45000,
      },
      {
        customer_total_cost_amount: 1202,
        customer_total_cost_bps: 267,
        deferred_days: 0,
        deferred_months: 0,
        eligible: true,
        installments_count: 4,
        payment_plan: [
          {
            customer_fee: 1202,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 11250,
            total_amount: 12452,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1637498000,
            purchase_amount: 11250,
            total_amount: 11250,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1640090000,
            purchase_amount: 11250,
            total_amount: 11250,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1642768400,
            purchase_amount: 11250,
            total_amount: 11250,
          },
        ],
        purchase_amount: 45000,
      },
      {
        annual_interest_rate: 1719,
        customer_total_cost_amount: 2667,
        customer_total_cost_bps: 593,
        deferred_days: 0,
        deferred_months: 0,
        eligible: true,
        installments_count: 10,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 1634819600,
            purchase_amount: 4773,
            refunded_interest: 0,
            total_amount: 4773,
          },
          {
            customer_fee: 0,
            customer_interest: 492,
            due_date: 1637498000,
            purchase_amount: 4274,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 472,
            due_date: 1640090000,
            purchase_amount: 4294,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 429,
            due_date: 1642768400,
            purchase_amount: 4337,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 371,
            due_date: 1645446800,
            purchase_amount: 4395,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 281,
            due_date: 1647866000,
            purchase_amount: 4485,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 250,
            due_date: 1650544400,
            purchase_amount: 4516,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 183,
            due_date: 1653136400,
            purchase_amount: 4583,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 127,
            due_date: 1655814800,
            purchase_amount: 4639,
            refunded_interest: 0,
            total_amount: 4766,
          },
          {
            customer_fee: 0,
            customer_interest: 62,
            due_date: 1658406800,
            purchase_amount: 4704,
            refunded_interest: 0,
            total_amount: 4766,
          },
        ],
        purchase_amount: 45000,
      },
    ],
  }
})

const animationDuration = 5500
jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())
describe('Button', () => {
  describe('Basics', () => {
    beforeEach(async () => {
      render(
        <IntlProvider messages={{}} locale="fr">
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          />
        </IntlProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays the button', () => {
      expect(screen.getByTestId('widget-button')).toBeInTheDocument()
    })
    xit('Opens the modal on click', async () => {
      act(() => {
        fireEvent.click(screen.getByTestId('widget-button'))
      })
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    })
  })

  describe('No plans provided', () => {
    beforeEach(async () => {
      render(
        <IntlProvider messages={{}} locale="fr">
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          />
        </IntlProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays all available payment plans', () => {
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
    })
    it(`display iterates on each message every ${animationDuration} ms then returns to the beginning`, () => {
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('4 mensualités de 112.5 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
    })
  })
  describe('paymentPlan includes credit', () => {
    beforeEach(async () => {
      render(
        <IntlProvider messages={{}} locale="fr">
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            configPlans={[
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
            ]}
          />
        </IntlProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays the message corresponding to the payment plan hovered', () => {
      expect(screen.getByText('450 € à payer le 31 janvier')).toBeInTheDocument()
      act(() => {
        fireEvent.mouseOver(screen.getByText('3x'))
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
      act(() => {
        fireEvent.mouseOver(screen.getByText('10x'))
      })
      expect(screen.getByText('10 mensualités de 47.73 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
    })
    it('Stops iterating when a element has been hovered', () => {
      act(() => {
        fireEvent.mouseOver(screen.getByText('3x'))
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
    })
  })
  describe('paymentPlan includes contains ineligible options', () => {
    beforeEach(async () => {
      render(
        <IntlProvider messages={{}} locale="fr">
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
                minAmount: 5000,
                maxAmount: 20000,
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
          />
        </IntlProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('Displays only provided plans (except p1x)', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.queryByText('1x')).not.toBeInTheDocument()
    })
    it('does not display plan that are not part of eligibility', () => {
      expect(screen.queryByText('8x')).not.toBeInTheDocument()
    })
    it('Only iterates over active plans', () => {
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
    })
    it('display conditions when inactive plans are hovered', () => {
      act(() => {
        fireEvent.mouseOver(screen.getByText('J+30'))
      })
      expect(screen.getByText('À partir de 500 €')).toBeInTheDocument()
      act(() => {
        fireEvent.mouseOver(screen.getByText('2x'))
      })
      expect(screen.getByText("Jusqu'à 200 €")).toBeInTheDocument()
    })
  })
  describe('custom transition delay', () => {
    beforeEach(async () => {
      render(
        <IntlProvider messages={{}} locale="fr">
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            transitionDelay={500}
          />
        </IntlProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it(`display iterates on each message every 500 ms then returns to the beginning`, () => {
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText('4 mensualités de 112.5 € (+ frais)')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText('3 mensualités de 150 € (+ frais)')).toBeInTheDocument()
    })
  })
})
