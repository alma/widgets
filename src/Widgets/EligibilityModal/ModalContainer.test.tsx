import React from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Context as ResponsiveContext } from 'react-responsive'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import { ModalContainer } from 'Widgets/EligibilityModal/ModalContainer'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

describe('ModalContainer', () => {
  describe('test responsiveness', () => {
    const setup = async () => {
      render(
        <ResponsiveContext.Provider value={{ width: 801 }}>
          <ModalContainer
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            onClose={() => {
              // eslint-disable-next-line no-console
              console.log('modal closed')
            }}
          />
        </ResponsiveContext.Provider>,
      )
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
    })
  })

  describe('No plans provided', () => {
    const setup = async () => {
      render(
        <ModalContainer
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          onClose={() => {
            // eslint-disable-next-line no-console
            console.log('modal closed')
          }}
        />,
      )
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
      expect(screen.getByText('10x')).toBeInTheDocument()
    })

    it('should display the first payment plans when initially opened', () => {
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
      )
      expect(element).toHaveTextContent('Total450,00 €')
      expect(element).toHaveTextContent('Dont coût du crédit (TTC)0,00 €')
      expect(element).toHaveTextContent('1 janvier 2022')
    })

    it('should display the schedule for the selected payment plan', async () => {
      await userEvent.click(screen.getByText('4x'))

      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        'Aujourd\'hui',
        '123,12 €',
        '1 janvier 2022',
        '112,50 €',
        '1 février 2022',
        '112,50 €',
        '1 mars 2022',
        '112,50 €',
      ]
      const expectedTotal = ['Total', '460,62 €', 'Dont coût du crédit (TTC)', '10,62 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })

  describe('No eligibility', () => {
    it('should display error message', async () => {
      render(
        <ModalContainer
          purchaseAmount={40000}
          configPlans={[]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          onClose={() => {
            // eslint-disable-next-line no-console
            console.log('modal closed')
          }}
        />,
      )
      await screen.findByTestId('modal-close-button')
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        "Oups, il semblerait que la simulation n'ait pas fonctionné.",
      )
    })
  })

  describe('Only one plan', () => {
    it('should display the schedule for the selected payment plan', async () => {
      render(
        <ModalContainer
          purchaseAmount={40000}
          configPlans={[
            {
              installmentsCount: 3,
              minAmount: 5000,
              maxAmount: 200000,
            },
          ]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          onClose={() => {
            // eslint-disable-next-line no-console
            console.log('modal closed')
          }}
        />,
      )
      await screen.findByTestId('modal-close-button')
      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        'Aujourd\'hui',
        '151,35 €',
        '1 janvier 2022',
        '150,00 €',
        '1 février 2022',
        '150,00 €',
      ]
      const expectedTotal = ['Total', '451,35 €', 'Dont coût du crédit (TTC)', '1,35 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })
})
