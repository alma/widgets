import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockP3XEligiblePlanWithFees } from '@/test/fixtures'
import { stubDateNow } from '@/test/story-stubs'
import {
  type InstallmentParams,
  installmentTemplate,
} from '@/widgets/eligibility-modal/templates/schedule/installment.template'

type InstallmentArgs = Omit<InstallmentParams, 'intl'>

const [dueToday, dueNextMonth] = mockP3XEligiblePlanWithFees.payment_plan

const meta: Meta<InstallmentArgs> = {
  render: (args, { globals }) => installmentTemplate({ ...args, intl: createIntl(globals.locale) }),
  beforeEach: () => stubDateNow(),
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<InstallmentArgs>

export const FirstDueToday: Story = { args: { installment: dueToday, index: 0 } }

// The first row keeps its dot and bold amount even when it isn't due today.
export const FirstDueLater: Story = { args: { installment: dueNextMonth, index: 0 } }

export const Next: Story = { args: { installment: dueNextMonth, index: 1 } }
