import React from 'react'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Context as ResponsiveContext } from 'react-responsive'

import render from '@/test'
import { statusResponse } from '@/types'
import { mockButtonPlans } from 'test/fixtures'
import EligibilityModal from 'Widgets/EligibilityModal'

const onClose = jest.fn()

describe('Test responsiveness', () => {
  it('should display the payments plans provided in eligibility', async () => {
    render(
      <ResponsiveContext.Provider value={{ width: 801 }}>
        <EligibilityModal
          eligibilityPlans={mockButtonPlans}
          status={statusResponse.SUCCESS}
          onClose={onClose}
        />
      </ResponsiveContext.Provider>,
    )
    await screen.findByTestId('modal-close-button')
    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
  })
})

describe('onClose event test', () => {
  it('should be launched when close button is clicked', async () => {
    render(
      <ResponsiveContext.Provider value={{ width: 801 }}>
        <EligibilityModal
          eligibilityPlans={mockButtonPlans}
          status={statusResponse.SUCCESS}
          onClose={onClose}
        />
      </ResponsiveContext.Provider>,
    )
    await screen.findByTestId('modal-close-button')
    await userEvent.click(screen.getByTestId('modal-close-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
