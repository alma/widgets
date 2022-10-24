import { fireEvent, screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { act } from 'react-dom/test-utils'
import render from 'test'
import { mockButtonPlans } from 'test/fixtures'
import { secondsToMilliseconds } from 'utils'
import ModalContainer from './ModalContainer'
import { Context as ResponsiveContext } from 'react-responsive'
jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})

global.Date.now = jest.fn(() => secondsToMilliseconds(1638350762))

describe('ModalContainer', () => {
  describe('test responsiveness', () => {
    beforeEach(async () => {
      render(
        <ResponsiveContext.Provider value={{ width: 801 }}>
          <ModalContainer
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            onClose={() => {
              console.log('modal closed')
            }}
          />
        </ResponsiveContext.Provider>,
      )
      await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
    })
  })

  describe('No plans provided', () => {
    beforeEach(async () => {
      render(
        <ModalContainer
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
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
      expect(element).toHaveTextContent('Dont frais (TTC)0,00 €')
      expect(element).toHaveTextContent('21 novembre 2021')
    })

    it('should display the schedule for the selected payment plan', () => {
      act(() => {
        fireEvent.click(screen.getByText('4x'))
      })
      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        '21 octobre 2021',
        '112,50 €',
        '21 novembre 2021',
        '112,50 €',
        '21 décembre 2021',
        '112,50 €',
        '21 janvier 2022',
        '112,50 €',
      ]
      const expectedTotal = ['Total', '462,02 €', 'Dont frais (TTC)', '12,02 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })

  describe('No eligibility', () => {
    beforeEach(async () => {
      render(
        <ModalContainer
          purchaseAmount={40000}
          configPlans={[]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          onClose={() => {
            console.log('modal closed')
          }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
    })

    it('should display error message', () => {
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        "Oups, il semblerait que la simulation n'ait pas fonctionné.",
      )
    })
  })

  describe('Only one plan', () => {
    beforeEach(async () => {
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
            console.log('modal closed')
          }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
    })

    it('should display the schedule for the selected payment plan', () => {
      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        '21 octobre 20211',
        '50,00 €',
        '21 novembre 20211',
        '50,00 €',
        '21 décembre 20211',
        '50,00 €',
      ]
      const expectedTotal = ['Total', '451,35 €', 'Dont frais (TTC)', '1,35 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })
})
