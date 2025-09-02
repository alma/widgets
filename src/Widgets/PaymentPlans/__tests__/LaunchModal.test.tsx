import React from 'react'

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

const checkModalElements = async (): Promise<void> => {
  expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
  const modalContainer = screen.getByTestId('modal-container')
  expect(within(modalContainer).getByText('3x')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 octobre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getByText('21 décembre 2021')).toBeInTheDocument()
  expect(within(modalContainer).getAllByText('150,00 €')).toHaveLength(2)
}

describe('Modal initializes with the correct plan', () => {
  it('after hovering a plan', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    await userEvent.hover(screen.getByText('3x'))

    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    // Open Modal with Know More button
    await userEvent.click(screen.getByText('En savoir plus...'))

    await checkModalElements()
  })

  it('after clicking a plan (fallback for mobile)', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await screen.findByTestId('widget-container')

    await userEvent.hover(screen.getByText('3x'))

    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    await userEvent.click(screen.getByText('3x'))

    await checkModalElements()
  })

  it('after a simple click on the badge, with no hover or click on a specific plan', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await screen.findByTestId('widget-container')

    // Open Modal with Know More button
    await userEvent.click(screen.getByText('En savoir plus...'))

    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    const modalContainer = screen.getByTestId('modal-container')
    expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
    expect(within(modalContainer).getAllByText('450,00 €')).toHaveLength(2)
  })
  it('should call onModalClose on close', async () => {
    const onModalClose = jest.fn()
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        onModalClose={onModalClose}
      />,
    )
    await screen.findByTestId('widget-container')

    // Open Modal with Know More button
    await userEvent.click(screen.getByText('En savoir plus...'))

    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('modal-close-button'))

    expect(onModalClose).toHaveBeenCalledTimes(1)
  })
})
