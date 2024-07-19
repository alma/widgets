import { act, screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import { configPlans } from 'test/fixtures'
import PaymentPlanWidget from '..'

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 500

describe('Custom transition delay', () => {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        transitionDelay={animationDuration}
        configPlans={configPlans} // specify all plans explicitly to display P1X. P1X is only displayed if provided in configPlans.
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it(`iterates on each plan every ${animationDuration}ms then returns to the beginning`, () => {
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    // P1X
    expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('124,52 € puis 3 x 112,50 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/450,00 € à payer le 3 juin 2022/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
  })
})
