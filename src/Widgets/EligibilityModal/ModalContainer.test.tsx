import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiMode } from 'consts'
import { rest } from 'msw'
import React from 'react'
import { Context as ResponsiveContext } from 'react-responsive'
import render from 'test'
import { server } from 'mocks/server'
import { mockButtonPlans } from 'test/fixtures'
import ModalContainer from './ModalContainer'

describe('ModalContainer', () => {
  describe('test responsiveness', () => {
    it('should display the payments plans provided in eligibility', async () => {
      server.use(
        rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockButtonPlans))
        }),
      )
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
      expect(screen.getByText('M+1')).toBeInTheDocument()
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
      expect(element).toHaveTextContent('Dont frais (TTC)0,00 €')
      expect(element).toHaveTextContent('21 novembre 2021')
    })

    it('should display the schedule for the selected payment plan', async () => {
      await userEvent.click(screen.getByText('4x'))

      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        '21 octobre 2021',
        '124,52 €',
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
    it('should display error message', async () => {
      server.use(
        rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, async (req, res, ctx) => {
          return res(ctx.json([]))
        }),
      )
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
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        "Oups, il semblerait que la simulation n'ait pas fonctionné.",
      )
    })
  })

  describe('Only one plan', () => {
    it('should display the schedule for the selected payment plan', async () => {
      server.use(
        rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, async (req, res, ctx) => {
          return res(
            ctx.json([
              {
                ...mockButtonPlans[3],
                payment_plan: [
                  {
                    customer_fee: 135,
                    customer_interest: 0,
                    due_date: 1634808362, // Timestamp to match "21 octobre 2021"
                    purchase_amount: 15000,
                    total_amount: 15135,
                  },
                  {
                    customer_fee: 0,
                    customer_interest: 0,
                    due_date: 1637486762, // Timestamp to match "21 novembre 2021"
                    purchase_amount: 15000,
                    total_amount: 15000,
                  },
                  {
                    customer_fee: 0,
                    customer_interest: 0,
                    due_date: 1640078762, // Timestamp to match "21 décembre 2021"
                    purchase_amount: 15000,
                    total_amount: 15000,
                  },
                ],
              },
            ]),
          )
        }),
      )
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
      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        '21 octobre 2021',
        '151,35 €',
        '21 novembre 2021',
        '150,00 €',
        '21 décembre 2021',
        '150,00 €',
      ]
      const expectedTotal = ['Total', '451,35 €', 'Dont frais (TTC)', '1,35 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })
})
