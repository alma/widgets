import { act, screen, waitFor, fireEvent } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'

/**
 * Test how the widget handles ineligible options.
 * What it shows and how it's displayed.
 *
 * @param animationDuration default duration between plan switch
 */
export default function IneligibleOptions(animationDuration: number): void {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        configPlans={[
          {
            installmentsCount: 1,
            minAmount: 5000,
            maxAmount: 20000,
          },
          {
            installmentsCount: 2,
            minAmount: 5000,
            maxAmount: 20000,
          },
          {
            installmentsCount: 1,
            deferredDays: 30,
            minAmount: 50000,
            maxAmount: 70000,
          },
          {
            installmentsCount: 3,
            minAmount: 5000,
            maxAmount: 50000,
          },
          {
            installmentsCount: 8,
            minAmount: 5000,
            maxAmount: 50000,
          },
        ]}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it('displays only provided plans (except p1x)', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.queryByText('1x')).not.toBeInTheDocument()
  })

  it('does not display plan that are not part of eligibility', () => {
    expect(screen.queryByText('8x')).not.toBeInTheDocument()
  })

  it('only iterates over active plans', () => {
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
  })

  it('display conditions when inactive plans are hovered', () => {
    act(() => {
      fireEvent.mouseEnter(screen.getByText('J+30'))
    })
    expect(screen.getByText('À partir de 500,00 €')).toBeInTheDocument()
    act(() => {
      fireEvent.mouseEnter(screen.getByText('2x'))
    })
    expect(screen.getByText("Jusqu'à 200,00 €")).toBeInTheDocument()
  })
}
