import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { PaymentPlan } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { DEFAULT_DUE_DATE } from '@/test/fixtures/plan-builders'
import { renderTemplate } from '@/test/utils/render-template'
import { installmentTemplate } from '@/widgets/eligibility-modal/templates/schedule/installment/installment.template'

type MessageFixture = {
  locales: Record<string, { callSites: Record<string, Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../../test/fixtures/messages.output.json'), 'utf8'),
)

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ')

const renderInstallment = (installment: PaymentPlan, index: number, locale: Locale = Locale.fr) =>
  renderTemplate(installmentTemplate({ installment, index, intl: createIntl(locale) }))

describe('installmentTemplate', () => {
  const dueToday = {
    due_date: DEFAULT_DUE_DATE,
    customer_fee: 0,
    customer_interest: 0,
    purchase_amount: 5000,
    total_amount: 5000,
  }

  it('should show today in a strong element', () => {
    const container = renderInstallment(dueToday, 0)

    expect(container.querySelector('strong')?.textContent).toBe("Aujourd'hui")
    expect(container).not.toHaveTextContent('2021')
  })

  it('should mark the first row as current, with a bold amount', () => {
    const container = renderInstallment(dueToday, 0)

    const [date, amount] = container.firstElementChild!.children
    expect(date.firstElementChild).toHaveClass('dot isCurrent', { exact: true })
    expect(amount).toHaveClass('bold', { exact: true })
  })

  it('should put the installment-{index} test ID on a div', () => {
    const container = renderInstallment(dueToday, 3)

    const row = container.firstElementChild
    expect(row?.localName).toBe('div')
    expect(row).toHaveAttribute('data-testid', 'installment-3')
  })

  it('should leave the amount of the other rows without a class attribute', () => {
    const container = renderInstallment(dueToday, 1)

    const [date, amount] = container.firstElementChild!.children
    expect(date.firstElementChild).toHaveClass('dot', { exact: true })
    expect(amount).not.toHaveAttribute('class')
  })

  it.each(Object.values(Locale))(
    'should format the date and amount like the fixtures in %s',
    (locale) => {
      const { callSites } = locales[locale]
      const container = renderInstallment(
        { ...dueToday, due_date: 1640995200, total_amount: 1234_50 },
        1,
        locale,
      )

      const [date, amount] = container.firstElementChild!.children
      expect(normalize(date.textContent ?? '')).toBe(
        normalize(callSites['installment.date']['1640995200000']),
      )
      expect(normalize(amount.textContent ?? '')).toBe(
        normalize(callSites['installment.amount']['1234.5']),
      )
    },
  )
})
