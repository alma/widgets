import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { infoTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/info/info.template'

const intl = createIntl(Locale.fr)

describe('infoTemplate', () => {
  it.each([false, true])(
    'should give the region the ID that describes the plan buttons for P1X %s',
    (isCurrentPlanP1X) => {
      renderTemplate(infoTemplate({ id: 'payment-info', isCurrentPlanP1X, intl }))

      const info = screen.getByRole('region', { name: 'Comment procéder au paiement' })
      expect(info).toHaveAttribute('id', 'payment-info')
    },
  )

  it('should keep the ARIA attributes', () => {
    renderTemplate(infoTemplate({ isCurrentPlanP1X: false, intl }))

    const info = screen.getByTestId('modal-info-element')
    expect(info).toHaveAttribute('aria-describedby', 'payment-info-description')
    expect(info).toHaveAttribute('tabindex', '-1')
  })
})
