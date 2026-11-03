import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  type TitleParams,
  titleTemplate,
} from '@/widgets/eligibility-modal/templates/title.template'

type TitleArgs = Omit<TitleParams, 'intl'>

const meta: Meta<TitleArgs> = {
  render: (args, { globals }) => titleTemplate({ ...args, intl: createIntl(globals.locale) }),
  args: { isSomePlanDeferred: false, isCurrentPlanP1X: false },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<TitleArgs>

export const Normal: Story = {}

export const PayNow: Story = { args: { isCurrentPlanP1X: true } }

// A deferred plan wins over a P1X current plan.
export const DeferredPlan: Story = { args: { isSomePlanDeferred: true, isCurrentPlanP1X: true } }
