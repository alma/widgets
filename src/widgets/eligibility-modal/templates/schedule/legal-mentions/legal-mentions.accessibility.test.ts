import { axe } from 'vitest-axe'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockP10XEligiblePlan, mockPayLater30DaysEligiblePlan } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { legalMentionsTemplate } from '@/widgets/eligibility-modal/templates/schedule/legal-mentions/legal-mentions.template'

const intl = createIntl(Locale.fr)

const renderLegalMentions = (currentPlan: EligibilityPlanToDisplay) =>
  renderTemplate(legalMentionsTemplate({ currentPlan, intl }))

describe('accessibility', () => {
  it.each([
    ['a Credit plan', mockP10XEligiblePlan],
    ['a Pay Later plan', mockPayLater30DaysEligiblePlan],
  ])('should not have any accessibility violations for %s', async (_name, plan) => {
    const container = renderLegalMentions(plan)

    expect(await axe(container)).toHaveNoViolations()
  })
})
