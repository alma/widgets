import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Widgets } from 'index'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import { AddReturnType } from 'widgets_controller'

describe('ModalContainer', () => {
  let ModalWidget: AddReturnType = undefined
  beforeEach(() => {
    render(
      <>
        <div id="alma-widget-modal"></div>
        <a href="#" id="alma-open-modal-button">
          Open modal with clickableSelector
        </a>
      </>,
    )

    const widgets = Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', ApiMode.TEST)
    ModalWidget = widgets.add(Widgets.Modal, {
      container: '#alma-widget-modal',
      clickableSelector: '#alma-open-modal-button',
      purchaseAmount: 400,
    })
  })

  it('should open with clickableSelector and open method', async () => {
    console.error = jest.fn()
    const openModalButton = screen.getByText('Open modal with clickableSelector')
    await userEvent.click(openModalButton)
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('modal-close-button'))

    ModalWidget?.open()
    await waitFor(() => expect(screen.queryByTestId('modal-close-button')).toBeInTheDocument())
    ModalWidget?.close({} as React.MouseEvent)
    await waitFor(() => expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument())
  })
})
