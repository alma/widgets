import { axe } from 'vitest-axe'

import type { PaymentPlan } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { installmentTemplate } from '@/widgets/eligibility-modal/templates/schedule/installment/installment.template'

const renderInstallment = (installment: PaymentPlan, index: number, locale: Locale = Locale.fr) =>
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
})
