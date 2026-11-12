import type { Meta, StoryContext, StoryObj } from '@storybook/web-components-vite'
import { userEvent, waitFor } from 'storybook/test'

import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import { ApiMode, Widgets } from '@/index'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  mockP10XEligiblePlan,
  mockP10XIneligiblePlan,
  mockP1XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures'

// One story per DCC2 output of the widget: plans needing disclosure show the know-more line and
// a clickable info line. The modal's DCC2 outputs are in the EligibilityModal-DCC2 stories.

type Args = Omit<PaymentPlanWidgetOptions, 'container'>

const CONTAINER_ID = 'alma-widget'

const waitForEligibility = ({ canvasElement }: StoryContext) =>
  waitFor(() => {
    if (canvasElement.querySelector('[data-testid="loader"]')) throw new Error('Still loading')
  })

const meta = {
  title: 'Widgets/PaymentPlans-DCC2',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
    transitionDelay: -1,
  },
  argTypes: {
    locale: {
      description: "Visitor's language",
      control: 'select',
      options: Object.values(Locale),
    },
  },
  parameters: { controls: { include: ['locale'] } },
  render: (options) => {
    const container = document.createElement('div')
    container.id = CONTAINER_ID
    // add() needs the container in the page, and Storybook inserts it right after render returns
    queueMicrotask(() =>
      Widgets.initialize('merchant_storybook', ApiMode.TEST).add(Widgets.PaymentPlans, {
        ...options,
        container: `#${CONTAINER_ID}`,
      }),
    )
    return container
  },
  play: waitForEligibility,
} satisfies Meta<Args>

export default meta

type Story = StoryObj<Args>

// A single plan is the current one, and the merchant config keeps P1X visible
const onlyPlan = (plan: EligibilityPlan): Story => ({
  args: {
    plans: [
      {
        installmentsCount: plan.installments_count,
        deferredDays: plan.deferred_days,
        deferredMonths: plan.deferred_months,
        minAmount: 90_00,
        maxAmount: 3350_00,
      },
    ],
  },
  parameters: { msw: { handlers: [eligibilityPlans([plan])] } },
})

export const InfoLineKnowMorePayLater: Story = onlyPlan(mockPayLaterOneMonthEligiblePlan)

export const InfoLineKnowMorePnx: Story = onlyPlan(mockP3XEligiblePlanWithFees)

export const InfoLineKnowMoreCredit: Story = onlyPlan(mockP10XEligiblePlan)

export const InfoLineNoKnowMorePayNow: Story = onlyPlan(mockP1XEligiblePlan)

export const InfoLineNoKnowMoreIneligibleCredit: Story = onlyPlan(mockP10XIneligiblePlan)

export const InfoLineKnowMoreKeyboardFocus: Story = {
  ...onlyPlan(mockP10XEligiblePlan),
  play: async (context) => {
    await waitForEligibility(context)
    // Alma logo, then the plan, then the clickable info line
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
  },
}
