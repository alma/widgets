import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { useFakeMatchMedia } from '@/test/match-media'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'

const onClose = vi.fn()

// Master renders EligibilityModal with the plans and a success status. Here the modal opens through
// add(Modal), with the request answered by those plans.
const renderEligibilityModal = async () => {
  server.use(eligibilityPlans(mockButtonPlans))
  const { handle } = await mountWidget('Modal', {
    clickableSelector: '',
    purchaseAmount: 45000,
    onClose,
  })
  handle?.open()
  await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
}

// Master's ResponsiveContext width of 801 px.
useFakeMatchMedia([desktopMediaQuery])

describe('Test responsiveness', () => {
  it('should display the payments plans provided in eligibility', async () => {
    await renderEligibilityModal()
    await screen.findByTestId('modal-close-button')
    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
  })
})

describe('onClose event test', () => {
  it('should be launched when close button is clicked', async () => {
    await renderEligibilityModal()
    await screen.findByTestId('modal-close-button')
    await userEvent.click(screen.getByTestId('modal-close-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
