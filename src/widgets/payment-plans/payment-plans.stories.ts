import type { Meta, StoryContext, StoryObj } from '@storybook/web-components-vite'
import { userEvent, waitFor } from 'storybook/test'

import type { EligibilityPlan } from '@/domain/plans.types'
import { ApiMode, Widgets } from '@/index'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  configPlans,
  mockEligibilityWithGrayedOutPlan,
  mockP10XIneligiblePlan,
  mockP4XIneligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures/plans'
import {
  eligibilityError,
  eligibilityPending,
  eligibilityPlans,
} from '@/test/msw/eligibility-handlers'
import { MERCHANT_CSS_MODES, MOBILE_MODES } from '@/test/storybook/storybook-modes.const'

// The stories only use the public API, so they render the same way after the Lit migration

type Options = Omit<PaymentPlanWidgetOptions, 'container'>

// Both out of the purchase amount range
const NO_ELIGIBLE_PLAN = [mockP4XIneligiblePlan, mockP10XIneligiblePlan]

const inCountry = (plans: EligibilityPlan[], transactionCountry: string) =>
  plans.map((plan) => ({ ...plan, transaction_country: transactionCountry }))

const API_RESPONSES = {
  'All plans eligible': (country: string) =>
    eligibilityPlans(inCountry(mockPlansAllEligible, country)),
  'Some plans not eligible': (country: string) =>
    eligibilityPlans(inCountry(mockEligibilityWithGrayedOutPlan, country)),
  'No plan eligible': (country: string) => eligibilityPlans(inCountry(NO_ELIGIBLE_PLAN, country)),
  'Request fails': () => eligibilityError(),
  'Request never answers': () => eligibilityPending(),
}

type Args = Options & { apiResponse?: keyof typeof API_RESPONSES; transactionCountry?: string }

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
  render: ({ apiResponse, transactionCountry, ...options }) => {
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
    transactionCountry: 'FR',
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
    transactionCountry: {
      description: 'Country the transaction is booked in (`transaction_country`)',
      control: 'select',
      options: ['FR', 'BE', 'LU', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB'],
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
    msw.use(
      API_RESPONSES[args.apiResponse ?? 'All plans eligible'](args.transactionCountry ?? 'FR'),
    )
  },
}
