import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { type InfoParams, infoTemplate } from '@/widgets/eligibility-modal/templates/info.template'

type InfoArgs = Omit<InfoParams, 'intl'>

const meta: Meta<InfoArgs> = {
  render: (args, { globals }) => infoTemplate({ ...args, intl: createIntl(globals.locale) }),
  args: { id: 'payment-info', isCurrentPlanP1X: false },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<InfoArgs>

export const Default: Story = {}

export const PayNow: Story = { args: { isCurrentPlanP1X: true } }
