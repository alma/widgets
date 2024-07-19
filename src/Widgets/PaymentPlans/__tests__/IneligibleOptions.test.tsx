import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiMode } from 'consts'
import { server } from 'mocks/server'
import { rest } from 'msw'
import ReactQueryProvider from 'providers/ReactQuery'
import React from 'react'
import render from 'test'
import { mockEligibilityPaymentPlanWithIneligiblePlan } from 'test/fixtures'
import PaymentPlanWidget from '..'

const animationDuration = 5600

describe('Ineligible options', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  describe('PaymentPlan has ineligible options from configPlans', () => {
    const renderDefault = async () => {
      render(
        <ReactQueryProvider>
          <PaymentPlanWidget
            purchaseAmount={45000}
            configPlans={[
              {
                installmentsCount: 1,
                deferredDays: 30,
                minAmount: 5000,
                maxAmount: 70000,
              },
              {
                installmentsCount: 2,
                minAmount: 5000,
                maxAmount: 50000,
              },
              {
                installmentsCount: 4,
                minAmount: 5000,
                maxAmount: 15000,
              },
              {
                installmentsCount: 8,
                minAmount: 5000,
                maxAmount: 50000,
              },
            ]}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          />
        </ReactQueryProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    }

    it('displays only provided plans (except p1x)', async () => {
      await renderDefault()
      expect(await screen.findByText('J+30')).toBeInTheDocument()
      expect(await screen.findByText('4x')).toBeInTheDocument()
      expect(await screen.queryByText('1x')).not.toBeInTheDocument()
    })

    it('does not display plan that are not part of eligibility', async () => {
      await renderDefault()

      expect(screen.queryByText('8x')).not.toBeInTheDocument()
    })

    it('only iterates over active plans', async () => {
      await renderDefault()

      expect(
        screen.getByText('450,00 € à payer le 21 novembre 2021 (sans frais)'),
      ).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('2 x 225,00 € (sans frais)')).toBeInTheDocument()
    })

    it('display conditions when inactive plans are hovered', async () => {
      await renderDefault()

      const user = userEvent.setup({ delay: null })

      await user.hover(screen.getByText('4x'))
      expect(screen.getByText("Jusqu'à 150,00 €")).toBeInTheDocument()
    })
  })

  describe('PaymentPlan has ineligible options from merchant config', () => {
    it('display conditions when non eligible plans are hovered', async () => {
      server.use(
        rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockEligibilityPaymentPlanWithIneligiblePlan))
        }),
      )
      render(
        <PaymentPlanWidget
          purchaseAmount={45000}
          configPlans={[
            {
              installmentsCount: 4,
              minAmount: 30000,
              maxAmount: 400000,
            },
            {
              installmentsCount: 10,
              minAmount: 5000,
              maxAmount: 50000,
            },
          ]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      const user = userEvent.setup({ delay: null })

      await user.hover(screen.getByText('10x'))
      expect(screen.getByText('À partir de 900,00 €')).toBeInTheDocument()
      await user.hover(screen.getByText('4x'))
      expect(screen.getByText("Jusqu'à 200,00 €")).toBeInTheDocument()
    })
  })
})
