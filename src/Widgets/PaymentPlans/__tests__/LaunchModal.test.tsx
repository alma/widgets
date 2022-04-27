import { act, screen, waitFor, fireEvent, within } from '@testing-library/react'
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

describe('Modal initializes with the correct plan', () => {
  it('after hovering a plan', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    act(() => {
      fireEvent.mouseEnter(screen.getByText('3x'))
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('widget-button'))
    })

    checkModalElements()
  })

  it('after clicking a plan (fallback for mobile)', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    act(() => {
      fireEvent.mouseOver(screen.getByText('3x'))
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByText('3x'))
    })
    checkModalElements()
  })

  it('after a simple click on the badge, with no hover or click on a specific plan', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    act(() => {
      fireEvent.click(screen.getByTestId('widget-button'))
    })
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    const modalContainer = screen.getByTestId('modal-container')
    expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
    expect(within(modalContainer).getAllByText('450,00 €')).toHaveLength(2)
  })
})

async function checkModalElements(): Promise<void> {
  expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
  const modalContainer = screen.getByTestId('modal-container')
  expect(within(modalContainer).getByText('3x')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 octobre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getByText('151,35 €')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 décembre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getAllByText('150,00 €')).toHaveLength(2)
}
