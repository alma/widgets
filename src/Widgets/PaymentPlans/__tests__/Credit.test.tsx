import React from 'react'

import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

const animationDuration = 5600 // 5500 + Time for transition

describe('PaymentPlan has credit', () => {
  afterAll(() => {
    jest.useRealTimers()
  })
  const setUpTest = async () => {
    render(
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
      />,
    )
    await screen.findByTestId('widget-container')
  }

  it('displays the message corresponding to the payment plan hovered', async () => {
    await setUpTest()

    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    await userEvent.hover(screen.getByText('3x'))
    expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
    await userEvent.hover(screen.getByText('10x'))
    expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
    expect(screen.getByText(/Cliquez pour en savoir plus/)).toBeInTheDocument()
  })

  const infoLine = () => document.getElementById('payment-info-text') as HTMLElement

  it('shows the breakdown and the know-more line for a credit plan', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('10x'))

    expect(infoLine()).toHaveTextContent('47,73 € puis 9 x 47,66 €')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).toHaveAttribute('role', 'button')
  })

  it('shows the know-more line for a P2X-P4X plan, which had none before', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('3x'))

    expect(infoLine()).toHaveTextContent('151,35 € puis 2 x 150,00 €')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
  })

  it('keeps the deferred wording and adds the know-more line for a deferred P1X plan', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('M+1'))

    expect(infoLine()).toHaveTextContent('450,00 € à payer le 21 novembre 2021')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).toHaveAttribute('role', 'button')
  })

  it('leaves a non-deferred P1X plan with a single, non-clickable line', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('Payer maintenant'))

    expect(infoLine()).toHaveTextContent('Payer maintenant 450,00 €')
    expect(infoLine()).not.toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).not.toHaveAttribute('role', 'button')
  })

  it('stops iterating when an element has been hovered', async () => {
    const user = userEvent.setup({ delay: null })

    jest.useFakeTimers()
    await setUpTest()

    await user.hover(screen.getByText('3x'))

    await screen.findByText('151,35 € puis 2 x 150,00 €')

    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })

    await screen.findByText('151,35 € puis 2 x 150,00 €') // Does not change
  })
})
