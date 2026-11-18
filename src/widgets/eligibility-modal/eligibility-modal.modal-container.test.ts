import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { ApiMode, Widgets } from '@/index'
import type { AddReturnType } from '@/public-api/widgets'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { server } from '@/test/msw-server'

describe('ModalContainer', () => {
  let ModalWidget: AddReturnType
  const setup = () => {
    // Master's test doesn't mock the request. Here an unanswered request fails the test.
    server.use(eligibilityPlans(mockButtonPlans))
    document.body.innerHTML = `<div id="alma-widget-modal"></div>
      <a href="#" id="alma-open-modal-button">Open modal with clickableSelector</a>`

    const widgets = Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', ApiMode.TEST)
    ModalWidget = widgets.add(Widgets.Modal, {
      container: '#alma-widget-modal',
      clickableSelector: '#alma-open-modal-button',
      purchaseAmount: 400,
    })
  }
  beforeEach(() => {
    setup()
  })

  it('should open with clickableSelector and open method', async () => {
    const openModalButton = screen.getByText('Open modal with clickableSelector')
    await userEvent.click(openModalButton)
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('modal-close-button'))

    ModalWidget?.open()
    await screen.findByTestId('modal-close-button')
    ModalWidget?.close({} as MouseEvent)
    await waitFor(() => expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument())
  })
})
