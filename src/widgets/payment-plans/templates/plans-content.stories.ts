import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { nothing } from 'lit'
import { fn } from 'storybook/test'

import { requiresLegalDisclosure } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { mockDisplayPlansAllEligible } from '@/test/fixtures'
import { paymentPlanInfoTextTemplate } from '@/widgets/common/plan-strings.template'
import {
  plansLoadingTemplate,
  type PlansContentParams,
  plansContentTemplate,
} from '@/widgets/payment-plans/templates/plans-content.template'

// The info line and its clickable state come from the current plan, as in the element.
type Args = Omit<PlansContentParams, 'info' | 'isInfoClickable'>

const P2X_INDEX = 2

const isClickable = (plan: EligibilityPlanToDisplay | undefined) =>
  !!plan?.eligible && requiresLegalDisclosure(plan)

const meta: Meta<Args> = {
  render: (args, { globals }) => {
    const intl = createIntl(globals.locale)
    const plan = args.plans[args.current]
    return plansContentTemplate(
      {
        ...args,
        isInfoClickable: isClickable(plan),
        info: plan ? paymentPlanInfoTextTemplate({ plan, intl }) : nothing,
      },
      intl,
    )
  },
  args: {
    plans: mockDisplayPlansAllEligible,
    current: P2X_INDEX,
    monochrome: true,
    hideBorder: false,
    announceText: '',
    onOpenModal: fn(),
    onPlanHover: fn(),
    onPlanLeave: fn(),
    onPlanKeyDown: fn(),
    onPlanClick: fn(),
  },
}

export default meta

type Story = StoryObj<Args>

// Master's stories in payment-plans.stories.ts cover the other states and options through add().
export const Pending: Story = {
  render: () => plansLoadingTemplate(),
}

export const SeveralPlans: Story = {}
