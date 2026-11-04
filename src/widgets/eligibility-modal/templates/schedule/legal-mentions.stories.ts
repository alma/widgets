import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockP10XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLater30DaysEligiblePlanWithFees,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures'
import {
  type LegalMentionsParams,
  legalMentionsTemplate,
} from '@/widgets/eligibility-modal/templates/schedule/legal-mentions.template'

type LegalMentionsArgs = Omit<LegalMentionsParams, 'intl'>

const meta: Meta<LegalMentionsArgs> = {
  render: (args, { globals }) =>
    legalMentionsTemplate({ ...args, intl: createIntl(globals.locale) }),
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<LegalMentionsArgs>

// Credit always uses the without-fees wording, even with a nonzero customer cost.
export const Credit: Story = { args: { currentPlan: mockP10XEligiblePlan } }

export const PnxWithoutFees: Story = { args: { currentPlan: mockP2XEligiblePlan } }

export const PnxWithFees: Story = { args: { currentPlan: mockP3XEligiblePlanWithFees } }

// Outside France, Alma is a payment institution and the merchant sentence goes away.
export const PnxOutsideFrance: Story = {
  args: { currentPlan: mockP2XEligiblePlan.withCountry('IT') },
}

// A deferred plan with more than one installment isn't Pay Later.
export const DeferredPnx: Story = {
  args: { currentPlan: mockDeferredMultiInstallmentPlanWithoutFees },
}

export const PayLaterWithoutFees: Story = { args: { currentPlan: mockPayLater30DaysEligiblePlan } }

export const PayLaterWithFees: Story = {
  args: { currentPlan: mockPayLater30DaysEligiblePlanWithFees },
}

export const PayLaterInMonths: Story = { args: { currentPlan: mockPayLaterOneMonthEligiblePlan } }

// Master formats the epoch as the due date.
export const PayLaterWithoutDueDate: Story = {
  args: { currentPlan: { ...mockPayLater30DaysEligiblePlan, payment_plan: [] } },
}
