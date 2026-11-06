import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockCards } from '@/test/fixtures'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator.template'
import {
  type ModalLayoutParams,
  modalLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/modal-layout.template'

type ModalLayoutArgs = Omit<ModalLayoutParams, 'intl' | 'children'>

const meta: Meta<ModalLayoutArgs> = {
  render: (args, { globals }) =>
    modalLayoutTemplate({
      ...args,
      children: loadingIndicatorTemplate(),
      intl: createIntl(globals.locale),
    }),
  parameters: { modalContainer: 'shell' },
  args: { isCurrentPlanP1X: false, isSomePlanDeferred: false, cards: mockCards },
}

export default meta

type Story = StoryObj<ModalLayoutArgs>

export const BigScreen: Story = {
  args: { isBigScreen: true },
  globals: { viewport: { value: 'desktop' } },
}

export const SmallScreen: Story = {
  args: { isBigScreen: false },
  globals: { viewport: { value: 'mobile' } },
}
