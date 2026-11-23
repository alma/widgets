import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type ModalShellParams,
  modalShellTemplate,
} from '@/widgets/eligibility-modal/templates/modal-shell/modal-shell.template'

const intl = createIntl(Locale.fr)

const renderShell = (params: Partial<ModalShellParams> = {}) =>
  renderTemplate(modalShellTemplate({ onClose: vi.fn(), intl, ...params }))

describe('modalShellTemplate', () => {
  it('should render the close button with its type, test ID and classes', () => {
    renderShell()

    const button = screen.getByRole('button', { name: 'Fermer la fenêtre' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-testid', 'modal-close-button')
    expect(button).toHaveClass('closeButton alma-eligibility-modal-close-button', { exact: true })
  })

  it('should call onClose with the click event', async () => {
    const onClose = vi.fn()
    renderShell({ onClose })

    await userEvent.click(screen.getByTestId('modal-close-button'))

    expect(onClose).toHaveBeenCalledOnce()
    expect(onClose.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(onClose.mock.calls[0][0]).toHaveProperty('type', 'click')
  })

  it('should render the cross icon without a class', () => {
    renderShell()

    const cross = screen.getByTestId('modal-close-button').querySelector('svg')
    expect(cross).not.toHaveAttribute('class')
  })

  it.each([
    [true, 'content contentScrollable'],
    [false, 'content'],
  ])('should render the content div with scrollable %s', (scrollable, classes) => {
    const container = renderShell({ scrollable })

    expect(container.lastElementChild).toHaveClass(classes, { exact: true })
  })

  it('should add the content class it is given', () => {
    const container = renderShell({ contentClassName: 'extra' })

    expect(container.lastElementChild).toHaveClass('content extra', { exact: true })
  })
})
