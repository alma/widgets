import React from 'react'

import { screen } from '@testing-library/react'
import { Context as ResponsiveContext } from 'react-responsive'

import render from '@/test'
import { statusResponse } from '@/types'
import { desktopWidth } from '@/utils'
import { mockButtonPlans } from 'test/fixtures'
import EligibilityModal from 'Widgets/EligibilityModal'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

it('should not display card logos if they are not provided', () => {
  render(
    <EligibilityModal
      eligibilityPlans={mockButtonPlans}
      initialPlanIndex={0}
      status={statusResponse.SUCCESS}
      onClose={() => jest.fn()}
    />,
  )

  expect(screen.queryByTestId('card-logos')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-amex')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-cb')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should not display card logos if an empty array is provided', () => {
  render(
    <EligibilityModal
      eligibilityPlans={mockButtonPlans}
      initialPlanIndex={0}
      cards={[]}
      status={statusResponse.SUCCESS}
      onClose={() => jest.fn()}
    />,
  )

  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-amex')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-cb')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display provided card logos', () => {
  render(
    <EligibilityModal
      eligibilityPlans={mockButtonPlans}
      initialPlanIndex={0}
      status={statusResponse.SUCCESS}
      onClose={() => jest.fn()}
      cards={['amex', 'cb']}
    />,
  )
  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display provided card logos with Desktop Modal', () => {
  render(
    <ResponsiveContext.Provider value={{ width: desktopWidth }}>
      <EligibilityModal
        eligibilityPlans={mockButtonPlans}
        initialPlanIndex={0}
        status={statusResponse.SUCCESS}
        onClose={() => jest.fn()}
        cards={['amex', 'cb']}
      />
    </ResponsiveContext.Provider>,
  )
  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display all cards logos', () => {
  render(
    <EligibilityModal
      eligibilityPlans={mockButtonPlans}
      initialPlanIndex={0}
      status={statusResponse.SUCCESS}
      onClose={() => jest.fn()}
      cards={['amex', 'cb', 'mastercard', 'visa']}
    />,
  )
  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-mastercard')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-visa')).toBeInTheDocument()
})
