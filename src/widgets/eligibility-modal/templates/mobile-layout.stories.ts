import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockCards } from '@/test/fixtures'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator.template'
import {
  type MobileLayoutParams,
  mobileLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/mobile-layout.template'

type MobileLayoutArgs = Omit<MobileLayoutParams, 'intl' | 'children'>

const meta: Meta<MobileLayoutArgs> = {
  render: (args, { globals }) =>
    mobileLayoutTemplate({
      ...args,
      children: loadingIndicatorTemplate(),
      intl: createIntl(globals.locale),
    }),
  parameters: { modalContainer: 'shell' },
  args: { isCurrentPlanP1X: false, isSomePlanDeferred: false, cards: mockCards },
  globals: { viewport: { value: 'mobile' } },
}

export default meta

type Story = StoryObj<MobileLayoutArgs>

export const Default: Story = {}

export const WithoutCards: Story = { args: { cards: undefined } }
