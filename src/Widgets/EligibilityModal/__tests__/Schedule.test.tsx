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
        customer_interest: 0,
        customer_fee: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: false,
        installments_count: 6,
        purchase_amount: 0,
        transaction_country: 'FR',
      }}
    />,
  )
  await screen.findByTestId('modal-installments-element')
})

it('should render the warning message and legal mentions for a plan requiring legal disclosure', async () => {
  render(
    <Schedule
      currentPlan={{
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        customer_interest: 0,
        customer_fee: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: false,
        installments_count: 6,
        purchase_amount: 0,
        transaction_country: 'FR',
      }}
    />,
  )
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).toBeInTheDocument()
  expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
})

it('should not render the warning message or legal mentions for a non-deferred P1X plan', async () => {
  render(
    <Schedule
      currentPlan={{
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
        customer_interest: 0,
        customer_fee: 0,
        deferred_days: 0,
        deferred_months: 0,
        eligible: false,
        installments_count: 1,
        purchase_amount: 0,
        transaction_country: 'FR',
      }}
    />,
  )
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.queryByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).not.toBeInTheDocument()
  expect(screen.queryByTestId('legal-mentions')).not.toBeInTheDocument()
})
