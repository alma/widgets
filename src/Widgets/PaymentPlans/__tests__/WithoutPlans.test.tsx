import React, { act } from 'react'

import { screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))
jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 5600

describe('No plans provided', () => {
  const setUp = async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={mockButtonPlans[0].purchase_amount}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await screen.findByTestId('widget-button')
  }
  beforeEach(async () => {
    await setUp()
  })

  it('displays all available payment plans', () => {
    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.queryByText('Payer maintenant')).not.toBeInTheDocument() // By default P1X is filtered
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it(`goes on next plan after ${animationDuration}ms`, () => {
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
  })
})
