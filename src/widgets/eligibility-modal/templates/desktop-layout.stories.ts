import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockCards } from '@/test/fixtures'
import {
  type DesktopLayoutParams,
  desktopLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/desktop-layout.template'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator.template'

type DesktopLayoutArgs = Omit<DesktopLayoutParams, 'intl' | 'children'>

const meta: Meta<DesktopLayoutArgs> = {
  render: (args, { globals }) =>
    desktopLayoutTemplate({
      ...args,
      children: loadingIndicatorTemplate(),
      intl: createIntl(globals.locale),
    }),
  parameters: { modalContainer: 'shell' },
  args: { isCurrentPlanP1X: false, isSomePlanDeferred: false, cards: mockCards },
  globals: { viewport: { value: 'desktop' } },
}

export default meta

type Story = StoryObj<DesktopLayoutArgs>

export const Default: Story = {}

export const WithoutCards: Story = { args: { cards: undefined } }
