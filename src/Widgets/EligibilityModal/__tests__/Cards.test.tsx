import { screen } from '@testing-library/react'
import React from 'react'
import render from 'test'
import { mockButtonPlans } from 'test/fixtures'
import { apiStatus } from 'types'
import EligibilityModal from '..'
import { Context as ResponsiveContext } from 'react-responsive'
import { desktopWidth } from 'utils'

describe('Cards', () => {
  it('should not display card logos if they are not provided', () => {
    render(
      <EligibilityModal
        eligibilityPlans={mockButtonPlans}
        initialPlanIndex={0}
        status={apiStatus.SUCCESS}
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
        status={apiStatus.SUCCESS}
        onClose={() => jest.fn()}
      />,
    )

    expect(screen.queryByTestId('card-logos')).toBeInTheDocument()
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
        status={apiStatus.SUCCESS}
        onClose={() => jest.fn()}
        cards={['amex', 'cb']}
      />,
    )
    expect(screen.queryByTestId('card-logos')).toBeInTheDocument()
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
          status={apiStatus.SUCCESS}
          onClose={() => jest.fn()}
          cards={['amex', 'cb']}
        />
      </ResponsiveContext.Provider>,
    )
    expect(screen.queryByTestId('card-logos')).toBeInTheDocument()
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
        status={'loading'}
        onClose={() => jest.fn()}
        cards={['amex', 'cb', 'mastercard', 'visa']}
      />,
    )
    expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
    expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
    expect(screen.queryByTestId('card-logo-mastercard')).toBeInTheDocument()
    expect(screen.queryByTestId('card-logo-visa')).toBeInTheDocument()
  })
})
