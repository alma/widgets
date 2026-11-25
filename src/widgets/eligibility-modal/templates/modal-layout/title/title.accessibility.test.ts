import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { titleTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/title/title.template'

const intl = createIntl(Locale.fr)

describe('titleTemplate', () => {
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'should give the title the ID that labels the dialog for deferred %s and P1X %s',
    (isSomePlanDeferred, isCurrentPlanP1X) => {
      renderTemplate(titleTemplate({ isSomePlanDeferred, isCurrentPlanP1X, intl }))

      expect(screen.getByTestId('modal-title-element')).toHaveAttribute('id', 'modal-title')
    },
  )
})
