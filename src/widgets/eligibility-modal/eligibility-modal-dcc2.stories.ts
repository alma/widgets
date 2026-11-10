import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { waitFor } from 'storybook/test'

import { ApiMode, Widgets } from '@/index'
import type { ModalOptions } from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockP10XEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures'
import type { EligiblePlanBuilder } from '@/test/planBuilders'
import { eligiblePlanBuilder } from '@/test/planBuilders'

// One story per DCC2 output of the modal (warning sentence and legal mentions), so Chromatic
// catches any change to it. Plans default to a French transaction.

type Args = Omit<ModalOptions, 'container' | 'clickableSelector'>

const CONTAINER_ID = 'alma-modal'
const OPEN_BUTTON_ID = 'alma-modal-open'

// Shared by every render, so add() replaces the open modal when the locale changes
const container = document.createElement('div')
container.id = CONTAINER_ID

const mockPayLaterOneMonthEligiblePlanWithFees = eligiblePlanBuilder()
  .withPurchaseAmount(45000)
  .withInstallmentsCount(1)
  .withDeferredMonths(1)
  .withFees(135)

// The modal opens in a portal at the end of the body
const waitForModal = async () => {
  await waitFor(() => {
    if (
      !document.querySelector('[data-testid="modal-close-button"]') ||
      document.querySelector('[data-testid="loader"]')
    ) {
      throw new Error('Still loading')
    }
  })
  // The desktop modal is 550px high, so the legal mentions sit below the fold of the schedule's
  // scroll area
  document.querySelector('[data-testid="legal-mentions"]')?.scrollIntoView({ block: 'end' })
}

const meta = {
  title: 'Widgets/EligibilityModal-DCC2',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
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

// A single plan is the one shown, and the merchant config keeps P1X and deferred plans visible
const onlyPlan = (plan: EligiblePlanBuilder, locale?: Locale): Story => ({
  args: {
    ...(locale && { locale }),
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

// Names start with the part of the modal that changes, and the stories compared sit side by side.
// Some stories are the same snapshot under two names, so each comparison stays explicit.
// Transactions are French unless the name says otherwise.

// Warning: the sentence above the total, in the transaction country's language
const inCountry = (country: string, locale: Locale): Story =>
  onlyPlan(mockP2XEligiblePlan.withCountry(country), locale)

export const WarningFr: Story = onlyPlan(mockP2XEligiblePlan)

export const WarningBeFr: Story = inCountry('BE', Locale.fr)

export const WarningBeNl: Story = inCountry('BE', Locale['nl-BE'])

export const WarningLu: Story = inCountry('LU', Locale.fr)

export const WarningNl: Story = inCountry('NL', Locale.nl)

export const WarningIt: Story = inCountry('IT', Locale.it)

export const WarningDe: Story = inCountry('DE', Locale.de)

export const WarningPt: Story = inCountry('PT', Locale.pt)

export const WarningEs: Story = inCountry('ES', Locale.es)

export const WarningGb: Story = inCountry('GB', Locale.en)

// No approved warning sentence, so none shows
export const NoWarningUnmappedCountry: Story = inCountry('US', Locale.en)

// Apr: the TAEG next to the credit cost, under the total. Fees count in the TAEG but not in the
// lending rate of the legal mentions, while interest counts in both.

export const AprZero: Story = onlyPlan(mockP2XEligiblePlan)

export const AprFromFeesPnx: Story = onlyPlan(mockP3XEligiblePlanWithFees)

export const AprFromFeesPayLater: Story = onlyPlan(mockPayLaterOneMonthEligiblePlanWithFees)

export const AprFromInterestCredit: Story = onlyPlan(mockP10XEligiblePlan)

// Fees only, no TAEG
export const NoAprPayNow: Story = onlyPlan(mockP1XEligiblePlan)

// LegalMentions: the credit sentence

export const LegalMentionsPayLaterWithoutFeesInMonths: Story = onlyPlan(
  mockPayLaterOneMonthEligiblePlan,
)

export const LegalMentionsPayLaterWithoutFeesInDays: Story = onlyPlan(
  mockPayLater30DaysEligiblePlan,
)

export const LegalMentionsPayLaterWithFeesInMonths: Story = onlyPlan(
  mockPayLaterOneMonthEligiblePlanWithFees,
)

export const LegalMentionsPnxWithoutFees: Story = onlyPlan(mockP2XEligiblePlan)

export const LegalMentionsPnxWithFees: Story = onlyPlan(mockP3XEligiblePlanWithFees)

export const LegalMentionsDeferredPnxWithFees: Story = onlyPlan(
  mockDeferredMultiInstallmentPlanWithFees,
)

export const LegalMentionsCredit: Story = onlyPlan(mockP10XEligiblePlan)

// Disclaimer: the end of the legal mentions. Alma is a financing company in France and a payment
// institution elsewhere, and only a French transaction without fees says the merchant bears the
// credit cost.

export const DisclaimerPayLaterFrenchTransaction: Story = onlyPlan(mockPayLaterOneMonthEligiblePlan)

export const DisclaimerPayLaterNonFrenchTransaction: Story = onlyPlan(
  mockPayLaterOneMonthEligiblePlan.withCountry('BE'),
)

export const DisclaimerPnxFrenchTransaction: Story = onlyPlan(mockP2XEligiblePlan)

export const DisclaimerPnxNonFrenchTransaction: Story = onlyPlan(
  mockP2XEligiblePlan.withCountry('BE'),
)

export const DisclaimerPnxWithFeesFrenchTransaction: Story = onlyPlan(mockP3XEligiblePlanWithFees)

// No warning, no legal mentions
export const NoDisclosurePayNow: Story = onlyPlan(mockP1XEligiblePlan)
