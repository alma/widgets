import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { fn } from 'storybook/test'

import { createIntl } from '@/shared/i18n/create-intl'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator.template'
import {
  type ModalShellParams,
  modalShellTemplate,
} from '@/widgets/eligibility-modal/templates/modal-shell.template'

type ModalShellArgs = Omit<ModalShellParams, 'intl' | 'children'>

const meta: Meta<ModalShellArgs> = {
  render: (args, { globals }) =>
    modalShellTemplate({
      ...args,
      children: loadingIndicatorTemplate(),
      intl: createIntl(globals.locale),
    }),
  parameters: { modalContainer: 'frame' },
  args: { onClose: fn() },
}

export default meta

type Story = StoryObj<ModalShellArgs>

// As the eligibility modal renders it.
export const Scrollable: Story = { args: { scrollable: true } }

export const NotScrollable: Story = {}
