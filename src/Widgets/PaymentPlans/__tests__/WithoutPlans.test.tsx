import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { act } from 'react-dom/test-utils'
import render from 'test'
import PaymentPlanWidget from '..'
import { mockButtonPlans } from 'test/fixtures'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})
jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 5600

describe('No plans provided', () => {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={mockButtonPlans[0].purchase_amount}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it('displays all available payment plans', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
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
