import type { Meta, StoryContext, StoryObj } from '@storybook/web-components-vite'
import { userEvent, waitFor } from 'storybook/test'

import { ApiMode, Widgets } from '@/index'
import { eligibilityError, eligibilityPending, eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  configPlans,
  mockEligibilityWithGrayedOutPlan,
  mockP10XIneligiblePlan,
  mockP4XIneligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures'
import { MERCHANT_CSS_MODES, MOBILE_MODES } from '@/test/storybookModes'
import { Locale, PaymentPlanWidgetOptions } from '@/types'

// The stories only use the public API, so they render the same way after the Lit migration

type Options = Omit<PaymentPlanWidgetOptions, 'container'>

// Both out of the purchase amount range
const NO_ELIGIBLE_PLAN = [mockP4XIneligiblePlan, mockP10XIneligiblePlan]

const API_RESPONSES = {
  'All plans eligible': () => eligibilityPlans(mockPlansAllEligible),
  'Some plans not eligible': () => eligibilityPlans(mockEligibilityWithGrayedOutPlan),
  'No plan eligible': () => eligibilityPlans(NO_ELIGIBLE_PLAN),
  'Request fails': () => eligibilityError(),
  'Request never answers': () => eligibilityPending(),
}

type Args = Options & { apiResponse?: keyof typeof API_RESPONSES }

const CONTAINER_ID = 'alma-widget'

const waitForEligibility = ({ canvasElement }: StoryContext) =>
  waitFor(() => {
    if (canvasElement.querySelector('[data-testid="loader"]')) throw new Error('Still loading')
  })

const meta = {
  title: 'Widgets/PaymentPlans',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
    // No plan cycling, so the snapshots are stable
    transitionDelay: -1,
  },
  parameters: { msw: { handlers: [eligibilityPlans(mockPlansAllEligible)] } },
  render: ({ apiResponse, ...options }) => {
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

export const Loading: Story = {
  parameters: { msw: { handlers: [eligibilityPending()] } },
  play: async () => {},
}

export const AllPlansEligible: Story = {
  parameters: { chromatic: { modes: MOBILE_MODES } },
}

export const ApiError: Story = {
  parameters: { msw: { handlers: [eligibilityError()] } },
}

export const HiddenWhenNotEligible: Story = {
  args: { plans: configPlans, hideIfNotEligible: true },
  parameters: { msw: { handlers: [eligibilityPlans(NO_ELIGIBLE_PLAN)] } },
}

// P1X only shows when the merchant configures it
export const PayNowActive: Story = {
  args: { plans: configPlans, suggestedPaymentPlan: 1 },
}

export const CreditActive: Story = {
  args: { suggestedPaymentPlan: 10 },
}

export const IneligiblePlanGrayedOut: Story = {
  args: { plans: configPlans },
  parameters: {
    msw: { handlers: [eligibilityPlans(mockEligibilityWithGrayedOutPlan)] },
    chromatic: { modes: MERCHANT_CSS_MODES },
  },
}

export const NoEligiblePlan: Story = {
  args: { plans: configPlans },
  parameters: { msw: { handlers: [eligibilityPlans(NO_ELIGIBLE_PLAN)] } },
}

export const NotMonochrome: Story = {
  args: { monochrome: false },
}

export const HideBorder: Story = {
  args: { hideBorder: true },
}

export const KeyboardFocusOnPlan: Story = {
  play: async (context) => {
    await waitForEligibility(context)
    // The Alma logo comes first, then the first plan
    await userEvent.tab()
    await userEvent.tab()
  },
}

// Not snapshotted
export const Playground: Story = {
  args: {
    apiResponse: 'All plans eligible',
    plans: configPlans,
    transitionDelay: 5500,
    monochrome: true,
    hideBorder: false,
    hideIfNotEligible: false,
    suggestedPaymentPlan: 1,
    cards: ['cb', 'visa', 'mastercard', 'amex'],
  },
  argTypes: {
    apiResponse: {
      description: 'Mocked eligibility API response',
      control: 'select',
      options: Object.keys(API_RESPONSES),
    },
    locale: { control: 'select', options: Object.values(Locale) },
    cards: {
      description: 'Card logos shown in the modal',
      control: 'check',
      options: ['cb', 'visa', 'mastercard', 'amex'],
    },
  },
  parameters: { chromatic: { disableSnapshot: true } },
  beforeEach: ({ args, msw }) => {
    msw.use(API_RESPONSES[args.apiResponse ?? 'All plans eligible']())
  },
}
