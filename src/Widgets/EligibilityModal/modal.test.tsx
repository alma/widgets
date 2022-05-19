import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { mockPlansAllEligible, mockPlansWithoutDeferred } from 'test/fixtures'
import { apiStatus } from 'types'
import { secondsToMilliseconds } from 'utils'
import EligibilityModal from '.'
import render from 'test'

global.Date.now = jest.fn(() => secondsToMilliseconds(1638350762))
describe('Modal', () => {
  describe('plans provided', () => {
    beforeEach(async () => {
      render(
        <EligibilityModal
          eligibilityPlans={mockPlansAllEligible}
          status={apiStatus.SUCCESS}
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
    it('should display the payments plans provided in eligibility', () => {
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
    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
      expect(screen.getByText('10x')).toBeInTheDocument()
    })
    it('should display the first payment plans when initially opened', () => {
      const installmentElement = screen.getByTestId('modal-installments-element')
      expect(installmentElement).toHaveTextContent('450,00 €')
      expect(installmentElement).toHaveTextContent('0,00 €')
      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('Dont frais')
    })
    it('should display the schedule for the selected payment plan', () => {
      act(() => {
        fireEvent.click(screen.getByText('4x'))
      })
      const installmentElement = screen.getByTestId('modal-installments-element')
      screen.debug()

      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      expect(installmentElement).toHaveTextContent('123,12 €')
      expect(installmentElement).toHaveTextContent('1 janvier 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      expect(installmentElement).toHaveTextContent('1 février 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      expect(installmentElement).toHaveTextContent('1 mars 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('460,62 €')
    })
    it('should display credit specific features', () => {
      act(() => {
        fireEvent.click(screen.getByText('10x'))
      })
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Dont coût du crédit')
      expect(totalElement).toHaveTextContent('26,64 € (TAEG 17,2 %)')
      expect(totalElement).toHaveTextContent(
        'Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
      )
    })
  })
  describe('No deferred plan provided', () => {
    it('should display a different title', () => {
      render(
        <EligibilityModal
          eligibilityPlans={mockPlansWithoutDeferred}
          initialPlanIndex={0}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
        'Payez en plusieurs fois par carte bancaire avec Alma.',
      )
    })
    it('should display card logos if they are provided', ()=> {
       render(
        <EligibilityModal
          eligibilityPlans={mockPlansWithoutDeferred}
          initialPlanIndex={0}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
          cards={ ['amex', 'cb'] }
        />,
      )
      expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
      expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
      expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
      expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()

    })
  })
  describe('plans and initial index provided', () => {
    it('should open with the correct plan selected', () => {
      render(
        <EligibilityModal
          eligibilityPlans={mockPlansAllEligible}
          initialPlanIndex={3}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      const installmentElement = screen.getByTestId('modal-installments-element')
      expect(installmentElement).toHaveTextContent('1,35 €')
      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      expect(installmentElement).toHaveTextContent('151,35 €')
      expect(installmentElement).toHaveTextContent('1 janvier 2022')
      expect(installmentElement).toHaveTextContent('150,00 €')
      expect(installmentElement).toHaveTextContent('1 février 2022')
      expect(installmentElement).toHaveTextContent('150,00 €')
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('451,35 €')
      expect(totalElement).toHaveTextContent('Dont frais')
    })
  })
  describe('empty plans', () => {
    it('should display the error message', () => {
      render(
        <EligibilityModal
          eligibilityPlans={[]}
          initialPlanIndex={0}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        "Oups, il semblerait que la simulation n'ait pas fonctionné.",
      )
    })
  })
})
