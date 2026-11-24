import { screen } from '@testing-library/dom'
import { html } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockCards } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type ModalLayoutParams,
  modalLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/modal-layout/modal-layout.template'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell/modal-shell.template'

const intl = createIntl(Locale.fr)

const renderModal = (params: Partial<ModalLayoutParams> = {}) =>
  renderTemplate(
    modalShellTemplate({
      onClose: vi.fn(),
      scrollable: true,
      children: modalLayoutTemplate({
        isBigScreen: false,
        isCurrentPlanP1X: false,
        isSomePlanDeferred: false,
        cards: mockCards,
        children: html`<p>Plans</p>`,
        intl,
        ...params,
      }),
      intl,
    }),
  )

describe.each([
  ['desktop', true],
  ['mobile', false],
])('%s layout', (_, isBigScreen) => {
  it('should not have any accessibility violations', async () => {
    expect(await axe(renderModal({ isBigScreen }))).toHaveNoViolations()
  })

  it('should render the dialog, labelled by the title', () => {
    renderModal({ isBigScreen })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Payez en plusieurs fois par carte bancaire avec Alma.')
  })
})
