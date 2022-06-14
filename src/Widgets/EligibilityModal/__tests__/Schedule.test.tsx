import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import render from 'test'
import Schedule from '../components/Schedule'

beforeEach(async () => {
  render(
    <Schedule
      currentPlan={{
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: false,
        installments_count: 6,
        purchase_amount: 0,
      }}
    />,
  )
})

it('should be displayed', async () => {
  await waitFor(() => expect(screen.getByTestId('modal-installments-element')).toBeInTheDocument())
  await waitFor(() => expect(screen.getByText('0,00 €')).toBeInTheDocument())
})
