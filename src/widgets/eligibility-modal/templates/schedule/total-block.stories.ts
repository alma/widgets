import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockP1XEligiblePlan, mockP3XEligiblePlanWithFees } from '@/test/fixtures'
import {
  type TotalBlockParams,
  totalBlockTemplate,
} from '@/widgets/eligibility-modal/templates/schedule/total-block.template'

type TotalBlockArgs = Omit<TotalBlockParams, 'intl'>

const meta: Meta<TotalBlockArgs> = {
  render: (args, { globals }) => totalBlockTemplate({ ...args, intl: createIntl(globals.locale) }),
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<TotalBlockArgs>

export const PayNow: Story = { args: { currentPlan: mockP1XEligiblePlan } }

export const PnxWithFees: Story = { args: { currentPlan: mockP3XEligiblePlanWithFees } }
