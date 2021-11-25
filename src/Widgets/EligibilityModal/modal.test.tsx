import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import EligibilityModal from '.'
import render from '../../test'

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
              deferred_months: 1,
              eligible: true,
              installments_count: 1,
              payment_plan: [
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1527199200,
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
                  due_date: 1524607200,
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
                  due_date: 1524607200,
                  purchase_amount: 22500,
                  total_amount: 22500,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1529791200,
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
                  due_date: 1524607200,
                  purchase_amount: 15000,
                  total_amount: 15135,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1529791200,
                  purchase_amount: 15000,
                  total_amount: 15000,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1532383200,
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
                  due_date: 1524607200,
                  purchase_amount: 11250,
                  total_amount: 12452,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1529791200,
                  purchase_amount: 11250,
                  total_amount: 11250,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1532383200,
                  purchase_amount: 11250,
                  total_amount: 11250,
                },
                {
                  customer_fee: 0,
                  customer_interest: 0,
                  due_date: 1534975200,
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
                  due_date: 1524607200,
                  purchase_amount: 4773,
                  refunded_interest: 0,
                  total_amount: 4773,
                },
                {
                  customer_fee: 0,
                  customer_interest: 492,
                  due_date: 1532383200,
                  purchase_amount: 4274,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 472,
                  due_date: 1532383200,
                  purchase_amount: 4294,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 429,
                  due_date: 1534975200,
                  purchase_amount: 4337,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 371,
                  due_date: 1537567200,
                  purchase_amount: 4395,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 281,
                  due_date: 1540159200,
                  purchase_amount: 4485,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 250,
                  due_date: 1542751200,
                  purchase_amount: 4516,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 183,
                  due_date: 1545343200,
                  purchase_amount: 4583,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 127,
                  due_date: 1547935200,
                  purchase_amount: 4639,
                  refunded_interest: 0,
                  total_amount: 4766,
                },
                {
                  customer_fee: 0,
                  customer_interest: 62,
                  due_date: 1550527200,
                  purchase_amount: 4704,
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
      expect(element).toHaveTextContent('25 mai 2018')
    })
    it('should display the the schedule for the selected payment plan', () => {
      act(() => {
        fireEvent.click(screen.getByText('4x'))
      })
      const element = screen.getByTestId('modal-installments-element')
      expect(element).toHaveTextContent('Total')
      expect(element).toHaveTextContent('462,02 €')
      expect(element).toHaveTextContent('25 avril 2018')
      expect(element).toHaveTextContent('124,52 €')
      expect(element).toHaveTextContent('24 juin 2018')
      expect(element).toHaveTextContent('112,50 €')
      expect(element).toHaveTextContent('24 juillet 2018')
      expect(element).toHaveTextContent('112,50 €')
      expect(element).toHaveTextContent('23 août 2018')
      expect(element).toHaveTextContent('112,50 €')
    })
    it('should display creadit specific features', () => {
      act(() => {
        fireEvent.click(screen.getByText('10x'))
      })
      const element = screen.getByTestId('modal-installments-element')
      expect(element).toHaveTextContent('Dont coût du crédit')
      expect(element).toHaveTextContent('26,67 € (TAEG 17,19 %)')
      expect(element).toHaveTextContent(
        'Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
      )
    })
  })
})
