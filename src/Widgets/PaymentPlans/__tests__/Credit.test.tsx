import { fireEvent, screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'
import { mockButtonPlans } from 'test/fixtures'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})
jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 5600 // 5500 + Time for transition

describe('PaymentPlan has credit', () => {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
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
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it('displays the message corresponding to the payment plan hovered', () => {
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByText('3x'))
    expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByText('10x'))
    expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
  })

  it('stops iterating when an element has been hovered', () => {
    fireEvent.mouseEnter(screen.getByText('3x'))
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    jest.advanceTimersByTime(animationDuration)
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
  })
})
