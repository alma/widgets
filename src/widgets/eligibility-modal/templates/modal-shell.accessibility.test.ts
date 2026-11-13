import { screen } from '@testing-library/dom'
import { html, nothing, render, type TemplateResult } from 'lit'
import { configureAxe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { renderTemplate } from '@/test/render-template'
import {
  ModalPortalController,
  type RequestClose,
} from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell.template'

// Master's Modal is react-modal around the shell. Here the portal controller renders react-modal's
// markup and the shell template goes in its content div.
class TestModal extends LightDomElement {
  onClose: RequestClose = () => {}

  readonly portal = new ModalPortalController(this, (event) => this.onClose(event))
}
customElements.define('test-modal-shell', TestModal)

const intl = createIntl(Locale.fr)

// The dialog takes its name from EligibilityModal's title, through aria-labelledby="modal-title".
// Master's test renders Modal without that title, so its dialog has no name either.
const axe = configureAxe({ rules: { 'aria-dialog-name': { enabled: false } } })

type ModalProps = {
  isOpen: boolean
  onClose: RequestClose
  children: TemplateResult
  // What master renders around the modal.
  page?: TemplateResult
}

// Master renders <Modal> in a container of <body>, and react-modal puts the modal at its end.
const renderModal = ({ isOpen, onClose, children, page }: ModalProps): HTMLElement => {
  const container = renderTemplate(html`${page ?? nothing}`)
  const modal = document.createElement('test-modal-shell') as TestModal
  modal.onClose = onClose
  container.append(modal)
  render(modalShellTemplate({ onClose, children, intl }), modal.portal.content)
  if (isOpen) {
    modal.portal.open()
  }
  return container
}

const modalPortal = (): HTMLElement => {
  const portal = document.querySelector<HTMLElement>('.ReactModalPortal')
  if (!portal) throw new Error('The modal is not open')
  return portal
}

// Master mocks requestAnimationFrame and waits a tick for react-modal's after-open classes.
const waitForAfterOpen = () =>
  vi.waitFor(() =>
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass(
      'ReactModal__Content--after-open',
    ),
  )

describe('Modal Accessibility Tests', () => {
  it('should not have any accessibility violations when closed', async () => {
    renderModal({ isOpen: false, onClose: () => {}, children: html`<div>Modal content</div>` })

    // Master always mounts its modal open. A closed one adds nothing to the page here.
    expect(document.querySelector('.ReactModalPortal')).not.toBeInTheDocument()

    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  })

  it('should not have any accessibility violations when open', async () => {
    renderModal({ isOpen: true, onClose: () => {}, children: html`<div>Modal content</div>` })

    // Wait for modal animations to complete
    await waitForAfterOpen()

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should have proper aria attributes when open', async () => {
    renderModal({
      isOpen: true,
      onClose: () => {},
      children: html`<div>
        <h2>Modal Title</h2>
        <p>Some modal content</p>
        <button type="button">Close</button>
      </div>`,
    })

    // Wait for modal animations to complete
    await waitForAfterOpen()

    // Check that the modal has proper aria attributes
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()

    // Check that no accessibility violations are detected
    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should have accessible close button with decorative icon', async () => {
    const mockClose = vi.fn()
    renderModal({ isOpen: true, onClose: mockClose, children: html`<div>Modal content</div>` })

    // Wait for modal animations to complete
    await waitForAfterOpen()

    const closeButton = await screen.findByTestId('modal-close-button')
    expect(closeButton).toHaveAttribute('aria-label')
    expect(closeButton).toHaveAttribute('type', 'button')

    // CrossIcon should be decorative (aria-hidden) since button has aria-label. Master checks it
    // only if the icon is there, and it always is.
    const icon = closeButton.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should properly manage focus when modal opens and closes', async () => {
    const mockClose = vi.fn()

    // Test modal in open state directly - this is the main accessibility concern
    renderModal({
      isOpen: true,
      onClose: mockClose,
      children: html`<div>Modal content</div>`,
      page: html`<button type="button">Outside button</button>`,
    })

    // Wait for modal animations to complete
    await waitForAfterOpen()

    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()

    // Verify outside button still exists (important for context)
    expect(screen.getByRole('button', { name: 'Outside button', hidden: true })).toBeInTheDocument()

    // Modal should be accessible and properly structured
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()

    // Verify the close button has proper accessibility attributes
    const closeButton = screen.getByTestId('modal-close-button')
    expect(closeButton).toHaveAttribute('aria-label')
    expect(closeButton).toHaveAttribute('type', 'button')

    // Test that modal can be closed (important for keyboard users)
    expect(mockClose).not.toHaveBeenCalled()
  })
})
