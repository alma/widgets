import { screen } from '@testing-library/dom'
import { html, nothing, render, type TemplateResult } from 'lit'
import { configureAxe } from 'vitest-axe'

import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import {
  ModalPortalController,
  type RequestClose,
} from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell/modal-shell.template'

// The portal controller renders the react-modal markup we copy, and the shell template goes in
// its content div.
class TestModal extends LightDomElement {
  onClose: RequestClose = () => {}

  readonly portal = new ModalPortalController(this, (event) => this.onClose(event))
}
customElements.define('test-modal-shell', TestModal)

const intl = createIntl(Locale.fr)

// The dialog takes its name from EligibilityModal's title, through aria-labelledby="modal-title".
// This test renders the shell without that title, so the dialog has no name.
const axe = configureAxe({ rules: { 'aria-dialog-name': { enabled: false } } })

type ModalProps = {
  isOpen: boolean
  onClose: RequestClose
  children: TemplateResult
  // The page content around the modal.
  page?: TemplateResult
}

// Copies react-modal, which puts the modal at the end of <body>, after the page.
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

// The after-open classes, copied from react-modal, arrive one frame after the open.
const waitForAfterOpen = () =>
  vi.waitFor(() =>
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass(
      'ReactModal__Content--after-open',
    ),
  )

describe('Modal Accessibility Tests', () => {
  it('should not have any accessibility violations when closed', async () => {
    renderModal({ isOpen: false, onClose: () => {}, children: html`<div>Modal content</div>` })

    // A closed modal adds nothing to the page.
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

    // The icon is decorative, since the button has an aria-label.
    const icon = closeButton.querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })
})
