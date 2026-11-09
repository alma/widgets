import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { axe } from 'vitest-axe'

import type { PaymentPlan } from '@/domain/plans/api/eligibility.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { DEFAULT_DUE_DATE } from '@/test/planBuilders'
import { renderTemplate } from '@/test/render-template'
import { installmentTemplate } from '@/widgets/eligibility-modal/templates/schedule/installment.template'

type MessageFixture = {
  locales: Record<string, { callSites: Record<string, Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ')

const renderInstallment = (installment: PaymentPlan, index: number, locale = Locale.fr) =>
  renderTemplate(installmentTemplate({ installment, index, intl: createIntl(locale) }))

describe('Installment Accessibility Tests', () => {
  const mockInstallment = {
    due_date: 1640995200, // 01/01/2022
    customer_fee: 0,
    customer_interest: 0,
    purchase_amount: 5000,
    total_amount: 5000,
  }

  it('should not have any accessibility violations', async () => {
    const container = renderInstallment(mockInstallment, 0)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper semantic structure', async () => {
    const container = renderInstallment(mockInstallment, 0)

    // Lit leaves a comment marker as the first child, so the element is the first element child.
    const installmentElement = container.firstElementChild
    expect(installmentElement).toBeInTheDocument()

    // Check that content is readable (French format)
    expect(container).toHaveTextContent('50,00')
    expect(container).toHaveTextContent('1 janvier 2022')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle installment with fees', async () => {
    const installmentWithFee = {
      due_date: 1640995200,
      customer_fee: 100,
      customer_interest: 0,
      purchase_amount: 5000,
      total_amount: 5100,
    }

    const container = renderInstallment(installmentWithFee, 1)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should be accessible for screen readers', async () => {
    const container = renderInstallment(mockInstallment, 0)

    // Check that there are no color/contrast issues
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })
})

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

  it('should leave the amount of the other rows without a class attribute', () => {
    const container = renderInstallment(dueToday, 1)

    const [date, amount] = container.firstElementChild!.children
    expect(date.firstElementChild).toHaveClass('dot', { exact: true })
    expect(amount).not.toHaveAttribute('class')
  })

  it.each(Object.values(Locale))(
    'should format the date and amount like master in %s',
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
