import { screen, waitFor, fireEvent } from '@testing-library/react'
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

beforeEach(async () => {
  render(
    <PaymentPlanWidget
      monochrome={false}
      purchaseAmount={40000}
      apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
    />,
  )
  await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
})

it('displays the button', () => {
  expect(screen.getByTestId('widget-button')).toBeInTheDocument()
})

it('opens the modal on click and close it', async () => {
  fireEvent.click(screen.getByTestId('widget-button'))
  expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
  fireEvent.click(screen.getByTestId('modal-close-button'))
  expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument()
})
