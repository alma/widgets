import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { titleTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/title/title.template'

const intl = createIntl(Locale.fr)

describe('titleTemplate', () => {
  it.each([
    [false, false, 'Payez en plusieurs fois par carte bancaire avec Alma.'],
    [false, true, 'Payez comptant par carte bancaire avec Alma.'],
    [true, false, 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.'],
    [true, true, 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.'],
  ])(
    'should show the title for deferred %s and P1X %s',
    (isSomePlanDeferred, isCurrentPlanP1X, title) => {
      renderTemplate(titleTemplate({ isSomePlanDeferred, isCurrentPlanP1X, intl }))

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title, {
        normalizeWhitespace: false,
      })
    },
  )
})
