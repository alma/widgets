import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockP2XEligiblePlan } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { scheduleTemplate } from '@/widgets/eligibility-modal/templates/schedule/schedule.template'

describe('scheduleTemplate', () => {
  it('should render a region with the given ID, named by its heading and described by the schedule', () => {
    renderTemplate(
      scheduleTemplate({
        currentPlan: mockP2XEligiblePlan,
        id: 'payment-schedule',
        intl: createIntl(Locale.fr),
      }),
    )

    const region = screen.getByRole('region', { name: 'Calendrier de paiement' })
    expect(region).toHaveAttribute('id', 'payment-schedule')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Calendrier de paiement' }),
    ).toHaveAttribute('id', 'payment-schedule-title')
    expect(region).toHaveAttribute('aria-describedby', 'payment-schedule-description')
    expect(document.getElementById('payment-schedule-description')).toContainElement(
      screen.getByTestId('modal-installments-element'),
    )
  })
})
