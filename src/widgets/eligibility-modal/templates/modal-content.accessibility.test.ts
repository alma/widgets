import { screen } from '@testing-library/dom'

import { StatusResponse } from '@/domain/api/eligibility.const'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
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
})
