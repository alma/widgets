import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { userEvent, waitFor, within } from 'storybook/test'

import { ApiMode, Widgets } from '@/index'
import { eligibilityPending, eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  configPlans,
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockP10XEligiblePlan,
  mockP10XIneligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP4XIneligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockPlansAllEligible,
  mockPlansWithoutDeferred,
} from '@/test/fixtures'
import { MERCHANT_CSS_MODES, MOBILE_MERCHANT_CSS_MODES, MOBILE_MODES } from '@/test/storybookModes'
import { ConfigPlan, Locale, ModalOptions } from '@/types'

// Like the PaymentPlans stories, these only use the public API

const PLANS = {
  'Pay now (P1X)': mockP1XEligiblePlan,
  'Pay later (M+1)': mockPayLaterOneMonthEligiblePlan,
  'Pay later (D+30)': mockPayLater30DaysEligiblePlan,
  '2x without fees': mockP2XEligiblePlan,
  '3x with fees': mockP3XEligiblePlanWithFees,
  '4x with fees': mockP4XEligiblePlanWithFees,
  '10x credit': mockP10XEligiblePlan,
  '3x deferred without fees': mockDeferredMultiInstallmentPlanWithoutFees,
  '3x deferred with fees': mockDeferredMultiInstallmentPlanWithFees,
}

type Args = Omit<ModalOptions, 'container' | 'clickableSelector'> & {
  plan?: keyof typeof PLANS
  transactionCountry?: string
}

// Every plan of the fixtures, P1X and the deferred 3x included
const MERCHANT_PLANS: ConfigPlan[] = [
  ...configPlans,
  { installmentsCount: 3, deferredDays: 30, minAmount: 90_00, maxAmount: 3350_00 },
]

// Both out of the purchase amount range
const NO_ELIGIBLE_PLAN = [mockP4XIneligiblePlan, mockP10XIneligiblePlan]

const CONTAINER_ID = 'alma-modal'
const OPEN_BUTTON_ID = 'alma-modal-open'

// Shared by every render, so add() replaces the open modal when a control changes
const container = document.createElement('div')
container.id = CONTAINER_ID

// The modal opens in a portal at the end of the body
const isModalOpen = () => !!document.querySelector('[data-testid="modal-close-button"]')

const waitForModal = () =>
  waitFor(() => {
    if (!isModalOpen() || document.querySelector('[data-testid="loader"]')) {
      throw new Error('Still loading')
    }
  })

const selectPlan = (label: string) => async () => {
  await waitForModal()
  const planButtons = document.querySelector<HTMLElement>(
    '.alma-eligibility-modal-eligibility-options',
  )
  if (!planButtons) throw new Error('No plan buttons in the modal')
  await userEvent.click(within(planButtons).getByText(label))
}

const meta = {
  title: 'Widgets/EligibilityModal',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
    plans: MERCHANT_PLANS,
  },
  parameters: { msw: { handlers: [eligibilityPlans(mockPlansAllEligible)] } },
  render: ({ plan, transactionCountry, ...options }) => {
    const openButton = document.createElement('button')
    openButton.id = OPEN_BUTTON_ID
    openButton.textContent = 'Open the modal'

    const page = document.createElement('div')
    page.append(openButton, container)

    // add() needs the page in the document, and Storybook inserts it right after render returns
    queueMicrotask(() =>
      Widgets.initialize('merchant_storybook', ApiMode.TEST)
        .add(Widgets.Modal, {
          ...options,
          container: `#${CONTAINER_ID}`,
          clickableSelector: `#${OPEN_BUTTON_ID}`,
        })
        ?.open(),
    )
    return page
  },
  play: waitForModal,
} satisfies Meta<Args>

export default meta

type Story = StoryObj<Args>

export const Loading: Story = {
  parameters: { msw: { handlers: [eligibilityPending()] } },
  play: () =>
    waitFor(() => {
      if (!isModalOpen()) throw new Error('Modal not open')
    }),
}

export const NoEligiblePlan: Story = {
  parameters: { msw: { handlers: [eligibilityPlans(NO_ELIGIBLE_PLAN)] } },
}

// No deferred plan, so the title has its "pay now" version
export const PayNow: Story = {
  parameters: {
    msw: { handlers: [eligibilityPlans([mockP1XEligiblePlan, ...mockPlansWithoutDeferred])] },
  },
}

export const ThreeTimesWithFees: Story = {
  parameters: { chromatic: { modes: { ...MERCHANT_CSS_MODES, ...MOBILE_MERCHANT_CSS_MODES } } },
  play: selectPlan('3x'),
}

export const Credit: Story = {
  parameters: { chromatic: { modes: MOBILE_MODES } },
  play: selectPlan('10x'),
}

export const DeferredInstallmentsWithFees: Story = {
  parameters: {
    msw: {
      handlers: [eligibilityPlans([mockP2XEligiblePlan, mockDeferredMultiInstallmentPlanWithFees])],
    },
  },
  play: selectPlan('3x'),
}

export const CardLogos: Story = {
  args: { cards: ['cb', 'visa', 'mastercard', 'amex'] },
  parameters: { chromatic: { modes: MOBILE_MODES } },
}

export const SkipLinks: Story = {
  play: async () => {
    await waitForModal()
    // The close button comes first, then the first skip link
    await userEvent.tab()
    await userEvent.tab()
  },
}

// Not snapshotted
export const Playground: Story = {
  args: {
    plan: '3x deferred with fees',
    transactionCountry: 'FR',
    cards: [],
  },
  argTypes: {
    plan: {
      description: 'Plan returned by the eligibility API',
      control: 'select',
      options: Object.keys(PLANS),
    },
    transactionCountry: {
      description: 'Country the transaction is booked in (`transaction_country`)',
      control: 'select',
      options: ['FR', 'BE', 'LU', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB'],
    },
    locale: {
      description: "Visitor's language",
      control: 'select',
      options: Object.values(Locale),
    },
    cards: {
      description: 'Card logos shown in the modal',
      control: 'check',
      options: ['cb', 'visa', 'mastercard', 'amex'],
    },
  },
  parameters: {
    controls: { include: ['plan', 'transactionCountry', 'locale', 'cards', 'purchaseAmount'] },
    chromatic: { disableSnapshot: true },
  },
  beforeEach: ({ args, msw }) => {
    const plan = PLANS[args.plan ?? '3x deferred with fees']
    msw.use(eligibilityPlans([plan.withCountry(args.transactionCountry ?? 'FR')]))
  },
}
