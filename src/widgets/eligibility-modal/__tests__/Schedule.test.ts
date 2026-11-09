import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { screen } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockP10XEligiblePlan, mockP1XEligiblePlan, mockP2XEligiblePlan } from '@/test/fixtures'
import { renderTemplate } from '@/test/render-template'
import { scheduleTemplate } from '@/widgets/eligibility-modal/templates/schedule/schedule.template'

type MessageFixture = {
  locales: Record<
    string,
    {
      messages: Record<string, string>
      callSites: Record<string, Record<string, string>>
    }
  >
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ').trim()

const renderSchedule = (currentPlan: EligibilityPlanToDisplay, locale = Locale.fr) =>
  renderTemplate(scheduleTemplate({ currentPlan, intl: createIntl(locale) }))

it('should be displayed', async () => {
  renderSchedule(mockP2XEligiblePlan)
  await screen.findByTestId('modal-installments-element')
})

it('should render the warning message and legal mentions for a plan requiring legal disclosure', async () => {
  renderSchedule(mockP2XEligiblePlan)
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).toBeInTheDocument()
  expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
})

it('should not render the warning message or legal mentions for a non-deferred P1X plan', async () => {
  renderSchedule(mockP1XEligiblePlan)
  await screen.findByTestId('modal-installments-element')
  expect(
    screen.queryByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
  ).not.toBeInTheDocument()
  expect(screen.queryByTestId('legal-mentions')).not.toBeInTheDocument()
})

it('should keep an empty warning container for an unmapped country', () => {
  const container = renderSchedule(mockP2XEligiblePlan.withCountry('ZZ'))

  const warningContainer = container.querySelector('.warningContainer')
  expect(warningContainer).toBeInTheDocument()
  expect(warningContainer?.children).toHaveLength(0)
  expect(warningContainer?.textContent?.trim()).toBe('')
})

// Total 1 234,50 € with a credit cost of 1,35 €: inputs of the fixture's call sites.
const p1x = { ...mockP1XEligiblePlan, purchase_amount: 1233_15, customer_total_cost_amount: 1_35 }
const credit = {
  ...mockP10XEligiblePlan,
  purchase_amount: 1233_15,
  customer_total_cost_amount: 1_35,
  annual_interest_rate: 1720,
}

describe.each(Object.values(Locale))("the total block in %s, like master's messages", (locale) => {
  const { messages, callSites } = locales[locale]
  const total = `${messages['installments.total-amount']}${callSites['total-block.total']['1234.5']}`

  it('should show the fees of a P1X plan', () => {
    renderSchedule(p1x, locale)

    const [totalLine, feesLine] = screen.getByTestId('modal-summary').children
    expect(normalize(totalLine.textContent ?? '')).toBe(normalize(total))
    expect(normalize(feesLine.textContent ?? '')).toBe(
      normalize(
        `${messages['installments.total-fees']}${callSites['total-block.credit-cost']['1.35']}`,
      ),
    )
  })

  it('should show the credit cost and the APR of another plan', () => {
    renderSchedule(credit, locale)

    const creditCostDisplay = messages['credit-features.credit-cost-display']
      .replace('[creditCost]', callSites['total-block.credit-cost-in-message']['1.35'])
      .replace('[annualPercentageRate]', callSites['total-block.annual-percentage-rate']['0.172'])
    const [totalLine, feesLine] = screen.getByTestId('modal-summary').children
    expect(normalize(totalLine.textContent ?? '')).toBe(normalize(total))
    expect(normalize(feesLine.textContent ?? '')).toBe(
      normalize(`${messages['credit-features.total-credit-cost']}${creditCostDisplay}`),
    )
  })
})
