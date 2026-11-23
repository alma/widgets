import { screen, within } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { infoTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/info/info.template'

const intl = createIntl(Locale.fr)

describe('infoTemplate', () => {
  it.each([
    [
      false,
      [
        'Choisissez Alma au moment du paiement.',
        'Laissez-vous guider et validez votre paiement en 2 minutes.',
        'Gardez le contrôle en avançant ou reculant vos échéances à votre rythme.',
      ],
      ['Alma', '2 minutes.', 'Gardez le contrôle'],
    ],
    [
      true,
      [
        'Choisissez Alma - Payer maintenant au moment du paiement.',
        'Renseignez les informations de votre carte bancaire.',
        // The French message has a space inside the strong tag and another after it.
        'La validation  de votre paiement est instantanée !',
      ],
      ['Alma - Payer maintenant', 'carte bancaire.', 'La validation '],
    ],
  ])('should show the info bullets for P1X %s', (isCurrentPlanP1X, bullets, strongTexts) => {
    renderTemplate(infoTemplate({ id: 'payment-info', isCurrentPlanP1X, intl }))

    const info = screen.getByRole('region', { name: 'Comment procéder au paiement' })
    expect(info).toHaveAttribute('id', 'payment-info')
    const items = within(info).getAllByRole('listitem')
    expect(
      items.map((item) => item.querySelector('.alma-eligibility-modal-bullet')?.textContent),
    ).toEqual(['1', '2', '3'])
    expect(
      items.map((item) => item.querySelector('.alma-eligibility-modal-info-message')?.textContent),
    ).toEqual(bullets)
    expect([...info.querySelectorAll('strong')].map((strong) => strong.textContent)).toEqual(
      strongTexts,
    )
  })

  it('should keep the ARIA attributes and the list class', () => {
    renderTemplate(infoTemplate({ isCurrentPlanP1X: false, intl }))

    const info = screen.getByTestId('modal-info-element')
    expect(info).toHaveAttribute('aria-describedby', 'payment-info-description')
    expect(info).toHaveAttribute('tabindex', '-1')
    expect(info.querySelector('ol#payment-info-description')).toHaveClass('listContainer', {
      exact: true,
    })
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('sr-only', { exact: true })
  })
})
