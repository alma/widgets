import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { useFakeMatchMedia } from '@/test/utils/match-media'
import { mountWidget } from '@/test/utils/mount-widget'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'

const onClose = vi.fn()

// The modal opens through add(Modal), with the request answered by the plans.
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
