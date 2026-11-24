import { screen } from '@testing-library/dom'

import { StatusResponse } from '@/domain/api/eligibility.const'
import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockP2XEligiblePlan, mockP3XEligiblePlanWithFees } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { modalContentTemplate } from '@/widgets/eligibility-modal/templates/modal-content.template'

describe('modalContentTemplate', () => {
  it('should render the skip links and the dialog, and no status, alert or plan group, when the request failed', () => {
    renderTemplate(
      modalContentTemplate({
        eligiblePlans: [],
        isSomePlanDeferred: false,
        status: StatusResponse.FAILED,
        currentPlanIndex: 0,
        setCurrentPlanIndex: vi.fn(),
        isBigScreen: false,
        onClose: vi.fn(),
        intl: createIntl(Locale.fr),
      }),
    )

    expect(screen.getByRole('navigation', { name: 'Navigation rapide' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('should describe each plan button with the payment steps', () => {
    renderTemplate(
      modalContentTemplate({
        eligiblePlans: [
          mockP2XEligiblePlan as EligibilityPlanToDisplay,
          mockP3XEligiblePlanWithFees as EligibilityPlanToDisplay,
        ],
        isSomePlanDeferred: false,
        status: StatusResponse.SUCCESS,
        currentPlanIndex: 0,
        setCurrentPlanIndex: vi.fn(),
        isBigScreen: false,
        onClose: vi.fn(),
        intl: createIntl(Locale.fr),
      }),
    )

    const buttons = screen.getAllByRole('button', { name: /^Sélectionner le plan de paiement/ })
    expect(buttons).toHaveLength(2)
    buttons.forEach((button) => {
      expect(button).toHaveAccessibleDescription(/Choisissez Alma/)
    })
  })
})
