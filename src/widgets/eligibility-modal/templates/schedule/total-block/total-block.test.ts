import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { screen } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockP10XEligiblePlan, mockP1XEligiblePlan } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { totalBlockTemplate } from '@/widgets/eligibility-modal/templates/schedule/total-block/total-block.template'

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
    resolve(
      __dirname,
      '../../../../../../tests/integration/contract/fixtures/messages.output.json',
    ),
    'utf8',
  ),
)

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ').trim()

const renderTotalBlock = (currentPlan: EligibilityPlanToDisplay, locale: Locale) =>
  renderTemplate(totalBlockTemplate({ currentPlan, intl: createIntl(locale) }))

// Total 1 234,50 € with a credit cost of 1,35 €: inputs of the fixture's call sites.
const p1x = { ...mockP1XEligiblePlan, purchase_amount: 1233_15, customer_total_cost_amount: 1_35 }
const credit = {
  ...mockP10XEligiblePlan,
  purchase_amount: 1233_15,
  customer_total_cost_amount: 1_35,
  annual_interest_rate: 1720,
}

describe.each(Object.values(Locale))('the total block in %s, like the fixtures', (locale) => {
  const { messages, callSites } = locales[locale]
  const total = `${messages['installments.total-amount']}${callSites['total-block.total']['1234.5']}`

  it('should show the fees of a P1X plan', () => {
    renderTotalBlock(p1x, locale)

    const [totalLine, feesLine] = screen.getByTestId('modal-summary').children
    expect(normalize(totalLine.textContent ?? '')).toBe(normalize(total))
    expect(normalize(feesLine.textContent ?? '')).toBe(
      normalize(
        `${messages['installments.total-fees']}${callSites['total-block.credit-cost']['1.35']}`,
      ),
    )
  })

  it('should show the credit cost and the APR of another plan', () => {
    renderTotalBlock(credit, locale)

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
