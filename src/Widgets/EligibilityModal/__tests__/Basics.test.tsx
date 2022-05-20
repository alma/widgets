import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Context as ResponsiveContext } from 'react-responsive'
import render from 'test'
import { mockButtonPlans } from 'test/fixtures'
import { apiStatus } from 'types'
import EligibilityModal from '..'

describe('Test responsiveness', () => {
  beforeEach(async () => {
    render(
      <ResponsiveContext.Provider value={{ width: 801 }}>
        <EligibilityModal
          eligibilityPlans={mockButtonPlans}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
        />
      </ResponsiveContext.Provider>,
    )
    await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
  })

  it('should display the payments plans provided in eligibility', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
  })
})

describe('onClose event test', () => {
  beforeEach(async () => {
    render(
      <ResponsiveContext.Provider value={{ width: 801 }}>
        <EligibilityModal
          eligibilityPlans={mockButtonPlans}
          status={apiStatus.SUCCESS}
          onClose={() => {
            console.log('modal closed')
          }}
        />
      </ResponsiveContext.Provider>,
    )
    await waitFor(() => expect(screen.getByTestId('modal-close-button')).toBeInTheDocument())
  })

  it('should be launched when close button is clicked', () => {
    console.log = jest.fn()
    act(() => {
      fireEvent.click(screen.getByTestId('modal-close-button'))
    })
    expect(console.log).toBeCalledWith('modal closed')
  })
})
