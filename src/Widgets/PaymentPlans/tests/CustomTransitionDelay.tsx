import { act, screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'

/**
 * Tests that if a different delay set on transitionDelay, the active status on payment option is updated at the specified time.
 * @param delay time in ms
 */
export default function CustomTransitionDelay(delay: number): void {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        transitionDelay={delay}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })
  it(`display iterates on each message every ${delay} ms then returns to the beginning`, () => {
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(delay)
    })
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(delay)
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(delay)
    })
    expect(screen.getByText('124,52 € puis 3 x 112,50 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(delay)
    })
    expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(delay)
    })
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
  })
}
