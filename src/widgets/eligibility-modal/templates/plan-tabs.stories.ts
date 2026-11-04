import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { render } from 'lit'
import { fn } from 'storybook/test'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockDisplayPlansAllEligible,
  mockDisplayPlansSingle,
  mockPayLater30DaysEligiblePlan,
} from '@/test/fixtures'
import {
  type PlanTabsParams,
  planTabsTemplate,
} from '@/widgets/eligibility-modal/templates/plan-tabs.template'

type PlanTabsArgs = Omit<PlanTabsParams, 'intl'>

const meta: Meta<PlanTabsArgs> = {
  render: (args, { globals }) => planTabsTemplate({ ...args, intl: createIntl(globals.locale) }),
  args: {
    eligibilityPlans: mockDisplayPlansAllEligible,
    currentPlanIndex: 0,
    setCurrentPlanIndex: fn(),
    id: 'payment-plans',
  },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<PlanTabsArgs>

export const FirstPlanActive: Story = {}

export const MiddlePlanActive: Story = { args: { currentPlanIndex: 3 } }

export const LastPlanActive: Story = { args: { currentPlanIndex: 5 } }

export const SinglePlan: Story = { args: { eligibilityPlans: mockDisplayPlansSingle } }

export const PayLaterInDays: Story = {
  args: {
    eligibilityPlans: mockDisplayPlansAllEligible.map((plan, index) =>
      index === 1 ? mockPayLater30DaysEligiblePlan : plan,
    ),
    currentPlanIndex: 1,
  },
}

// Keeps the selected index, so clicks, arrow keys, Home and End can be tried.
export const Interactive: Story = {
  render: (args, { globals }) => {
    const intl = createIntl(globals.locale)
    const container = document.createElement('div')
    const renderAt = (currentPlanIndex: number): void => {
      const setCurrentPlanIndex = (index: number) => {
        void args.setCurrentPlanIndex(index)
        renderAt(index)
      }
      render(planTabsTemplate({ ...args, currentPlanIndex, setCurrentPlanIndex, intl }), container)
    }
    renderAt(args.currentPlanIndex)
    return container
  },
}
