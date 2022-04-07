import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { mockPlansAllEligible } from 'test/fixtures'
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
  describe('plans and intial index provided', () => {
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
      const element = screen.getByTestId('modal-installments-element')
      expect(element).toHaveTextContent('Total')
      expect(element).toHaveTextContent('451,35 €')
      expect(element).toHaveTextContent('Dont frais')
      expect(element).toHaveTextContent('1,35 €')
      expect(element).toHaveTextContent("Aujourd'hui")
      expect(element).toHaveTextContent('151,35 €')
      expect(element).toHaveTextContent('1 janvier 2022')
      expect(element).toHaveTextContent('150,00 €')
      expect(element).toHaveTextContent('1 février 2022')
      expect(element).toHaveTextContent('150,00 €')
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
        "Oups, il semblerait que la simulation n'aie pas fonctionné.",
      )
    })
  })
})
