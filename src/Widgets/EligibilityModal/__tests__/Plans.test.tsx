import { fireEvent, screen, waitFor } from '@testing-library/react'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import React from 'react'
import render from 'test'
import { mockPlansAllEligible, mockPlansWithoutDeferred } from 'test/fixtures'
import { apiStatus } from 'types'
import EligibilityModal from '..'

global.Date.now = jest.fn(() => secondsToMilliseconds(1638350762))

describe('plans provided', () => {
  beforeEach(async () => {
    render(
      <EligibilityModal
        eligibilityPlans={mockPlansAllEligible}
        status={apiStatus.SUCCESS}
        onClose={() => jest.fn()}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
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
      'La validation de votre paiement est instantanée !',
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
    fireEvent.click(screen.getByText('4x'))
    const installmentElement = screen.getByTestId('modal-installments-element')

    expect(installmentElement).toHaveTextContent("Aujourd'hui")
    expect(installmentElement).toHaveTextContent('112,50 €')
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
    fireEvent.click(screen.getByText('10x'))
    const totalElement = screen.getByTestId('modal-summary')
    expect(totalElement).toHaveTextContent('Dont coût du crédit')
    expect(totalElement).toHaveTextContent('26,64 € (TAEG 17,2 %)')
    expect(
      screen.getByText(
        'Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
      ),
    ).toBeInTheDocument()
  })
})

describe('No deferred plan provided', () => {
  it('should display a different title', () => {
    render(
      <EligibilityModal
        eligibilityPlans={mockPlansWithoutDeferred}
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
    expect(installmentElement).toHaveTextContent("Aujourd'hui")
    expect(installmentElement).toHaveTextContent('150,00 €')
    expect(installmentElement).toHaveTextContent('1 janvier 2022')
    expect(installmentElement).toHaveTextContent('150,00 €')
    expect(installmentElement).toHaveTextContent('1 février 2022')
    expect(installmentElement).toHaveTextContent('150,00 €')
    const totalElement = screen.getByTestId('modal-summary')
    expect(totalElement).toHaveTextContent('Total')
    expect(totalElement).toHaveTextContent('451,35 €')
    expect(totalElement).toHaveTextContent('Dont frais (TTC)')
  })
})
describe('empty plans', () => {
  it('should display the error message', () => {
    render(
      <EligibilityModal
        eligibilityPlans={[]}
        status={apiStatus.SUCCESS}
        onClose={() => {
          console.log('modal closed')
        }}
      />,
    )
    const element = screen.getByTestId('modal-container')
    expect(element).toHaveTextContent("Oups, il semblerait que la simulation n'ait pas fonctionné.")
  })
})
