import type { Meta, StoryObj } from '@storybook/web-components-vite'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XAboveMaxDisplayPlan,
  mockP10XBelowMinDisplayPlan,
  mockP10XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLater30DaysEligiblePlanWithFees,
} from '@/test/fixtures'
import { paymentPlanInfoTextTemplate } from '@/widgets/common/plan-strings.template'

type InfoTextArgs = { plan: EligibilityPlanToDisplay }

const meta: Meta<InfoTextArgs> = {
  render: ({ plan }, { globals }) =>
    paymentPlanInfoTextTemplate({ plan, intl: createIntl(globals.locale) }),
}

export default meta

type Story = StoryObj<InfoTextArgs>

export const IneligibleAboveMax: Story = { args: { plan: mockP4XAboveMaxDisplayPlan } }

export const IneligibleBelowMin: Story = { args: { plan: mockP10XBelowMinDisplayPlan } }

export const PayLater: Story = { args: { plan: mockPayLater30DaysEligiblePlan } }

export const PayLaterWithFees: Story = { args: { plan: mockPayLater30DaysEligiblePlanWithFees } }

export const PayNow: Story = { args: { plan: mockP1XEligiblePlan } }

export const Credit: Story = { args: { plan: mockP10XEligiblePlan } }

export const SameAmountInstallments: Story = { args: { plan: mockP2XEligiblePlan } }

export const DifferentAmountInstallments: Story = { args: { plan: mockP3XEligiblePlanWithFees } }
