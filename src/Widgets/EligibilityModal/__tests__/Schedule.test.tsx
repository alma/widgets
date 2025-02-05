import React from 'react'

import { screen } from '@testing-library/react'

import render from '@/test'
import Schedule from 'Widgets/EligibilityModal/components/Schedule'

it('should be displayed', async () => {
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
  await screen.findByTestId('modal-installments-element')
})
