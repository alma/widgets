import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { secondsToMilliseconds } from 'utils'
import EligibilityModal from '.'
import render from '../../test'

global.Date.now = jest.fn(() => secondsToMilliseconds(1638350762))
describe('Modal', () => {
  it('should display if the isOpen boolean is set to true', async () => {
    render(
      <EligibilityModal
        eligibilityPlans={[]}
        isOpen={true}
        onClose={() => {
          console.log('modal closed')
        }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
  })
  it('should not display if the isOpen boolean is set to false', async () => {
    render(
      <EligibilityModal
        eligibilityPlans={[]}
        isOpen={false}
        onClose={() => {
          console.log('modal closed')
        }}
      />,
    )
    expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument()
  })
  describe('plans provided', () => {
    beforeEach(async () => {
      render(
        <EligibilityModal
          eligibilityPlans={[
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
                  due_date: 1638350762,
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
              deferred_months: 1,
              eligible: true,
              installments_count: 1,
              payment_plan: [
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1641029162,
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
                  due_date: 1638350762,
                  purchase_amount: 22500,
                  total_amount: 22500,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1641029162,
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
                  due_date: 1638350762,
                  purchase_amount: 15000,
                  total_amount: 15135,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1641029162,
                  purchase_amount: 15000,
                  total_amount: 15000,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1643707562,
                  purchase_amount: 15000,
                  total_amount: 15000,
                },
              ],
              purchase_amount: 45000,
            },
            {
              customer_total_cost_amount: 1062,
              customer_total_cost_bps: 236,
              deferred_days: 0,
              deferred_months: 0,
              eligible: true,
              installments_count: 4,
              payment_plan: [
                {
                  customer_fee: 1062,
                  customer_interest: 0,
                  due_date: 1638350762,
                  purchase_amount: 11250,
                  total_amount: 12312,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1641029162,
                  purchase_amount: 11250,
                  total_amount: 11250,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1643707562,
                  purchase_amount: 11250,
                  total_amount: 11250,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1646126762,
                  purchase_amount: 11250,
                  total_amount: 11250,
                },
              ],
              purchase_amount: 45000,
            },
            {
              annual_interest_rate: 1720,
              customer_total_cost_amount: 2664,
              customer_total_cost_bps: 592,
              deferred_days: 0,
              deferred_months: 0,
              eligible: true,
              installments_count: 10,
              payment_plan: [
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1638350762,
                  purchase_amount: 4770,
                  refunded_interest: 0,
                  total_amount: 4769,
                },
                {
                  customer_fee: 0,
                  customer_interest: 493,
                  due_date: 1641029162,
                  purchase_amount: 4273,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 488,
                  due_date: 1643707562,
                  purchase_amount: 4278,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 388,
                  due_date: 1646126762,
                  purchase_amount: 4378,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 370,
                  due_date: 1648805162,
                  purchase_amount: 4396,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 301,
                  due_date: 1651397162,
                  purchase_amount: 4465,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 250,
                  due_date: 1654075562,
                  purchase_amount: 4516,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 183,
                  due_date: 1656667562,
                  purchase_amount: 4583,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 127,
                  due_date: 1659345962,
                  purchase_amount: 4639,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 64,
                  due_date: 1662024362,
                  purchase_amount: 4702,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
              ],
              purchase_amount: 45000,
            },
          ]}
          isOpen={true}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
    })
    it('should launch the onclose method when close button is clicked', () => {
      console.log = jest.fn()
      act(() => {
        fireEvent.click(screen.getByTestId('modal-close-button'))
      })
      expect(console.log).toBeCalledWith('modal closed')
    })
    it('should display the payments plans provided in elgibility', () => {
      expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
        'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Choisissez Alma au moment du paiement.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Renseignez les informations demandées.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'La validation de votre paiement instantanée !',
      )
    })
    it('should display the payments plans provided in elgibility', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
      expect(screen.getByText('10x')).toBeInTheDocument()
    })
    it('should display the first payment plans when initially opened', () => {
      const element = screen.getByTestId('modal-installments-element')
      expect(element).toHaveTextContent('Total')
      expect(element).toHaveTextContent('450,00 €')
      expect(element).toHaveTextContent('Dont frais')
      expect(element).toHaveTextContent('0,00 €')
      expect(element).toHaveTextContent("Aujourd'hui")
    })
    it('should display the the schedule for the selected payment plan', () => {
      act(() => {
        fireEvent.click(screen.getByText('4x'))
      })
      const element = screen.getByTestId('modal-installments-element')
      screen.debug()
      expect(element).toHaveTextContent('Total')
      expect(element).toHaveTextContent('460,62 €')
      expect(element).toHaveTextContent("Aujourd'hui")
      expect(element).toHaveTextContent('123,12 €')
      expect(element).toHaveTextContent('1 janvier 2022')
      expect(element).toHaveTextContent('112,50 €')
      expect(element).toHaveTextContent('1 février 2022')
      expect(element).toHaveTextContent('112,50 €')
      expect(element).toHaveTextContent('1 mars 2022')
      expect(element).toHaveTextContent('112,50 €')
    })
    it('should display creadit specific features', () => {
      act(() => {
        fireEvent.click(screen.getByText('10x'))
      })
      const element = screen.getByTestId('modal-installments-element')
      expect(element).toHaveTextContent('Dont coût du crédit')
      expect(element).toHaveTextContent('26,64 € (TAEG 17,2 %)')
      expect(element).toHaveTextContent(
        'Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
      )
    })
  })
})
