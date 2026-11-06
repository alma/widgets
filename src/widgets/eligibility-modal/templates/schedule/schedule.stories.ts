import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockP1XEligiblePlan, mockP2XEligiblePlan } from '@/test/fixtures'
import { stubDateNow } from '@/test/story-stubs'
import {
  type ScheduleParams,
  scheduleTemplate,
} from '@/widgets/eligibility-modal/templates/schedule/schedule.template'

type ScheduleArgs = Omit<ScheduleParams, 'intl'>

const meta: Meta<ScheduleArgs> = {
  render: (args, { globals }) => scheduleTemplate({ ...args, intl: createIntl(globals.locale) }),
  args: { id: 'payment-schedule' },
  beforeEach: () => stubDateNow(),
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<ScheduleArgs>

export const Pnx: Story = { args: { currentPlan: mockP2XEligiblePlan } }

// No warning and no legal mentions.
export const PayNow: Story = { args: { currentPlan: mockP1XEligiblePlan } }

// Master keeps the warning container, empty.
export const UnmappedCountry: Story = {
  args: { currentPlan: mockP2XEligiblePlan.withCountry('ZZ') },
}
