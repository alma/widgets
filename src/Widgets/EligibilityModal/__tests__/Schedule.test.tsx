import React from 'react'

import { screen } from '@testing-library/react'

import render from '@/test'
import Schedule from 'Widgets/EligibilityModal/components/Schedule'
import { mockP1XEligiblePlan, mockP2XEligiblePlan, mockP4XIneligiblePlan } from 'test/fixtures'


it('should be displayed', async () => {
  render(
    <Schedule currentPlan={mockP2XEligiblePlan} />,
  )
  await screen.findByTestId('modal-installments-element')
})

it('should render the warning message and legal mentions for a plan requiring legal disclosure', async () => {
  render(
    <Schedule currentPlan={mockP2XEligiblePlan} />,
  )
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).toBeInTheDocument()
  expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
})

it('should not render the warning message or legal mentions for a non-deferred P1X plan', async () => {
  render(
    <Schedule currentPlan={mockP1XEligiblePlan} />,
  )
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.queryByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).not.toBeInTheDocument()
  expect(screen.queryByTestId('legal-mentions')).not.toBeInTheDocument()
})
