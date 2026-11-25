import { screen, within } from '@testing-library/dom'

import { StatusResponse } from '@/domain/api/eligibility.const'
import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type ModalContentParams,
  modalContentTemplate,
} from '@/widgets/eligibility-modal/templates/modal-content.template'

const p1x = mockP1XEligiblePlan as EligibilityPlanToDisplay
const p2x = mockP2XEligiblePlan as EligibilityPlanToDisplay
const p3x = mockP3XEligiblePlanWithFees as EligibilityPlanToDisplay

const renderContent = (params: Partial<ModalContentParams> = {}) =>
  renderTemplate(
    modalContentTemplate({
      eligiblePlans: [p2x, p3x],
      isSomePlanDeferred: false,
      status: StatusResponse.SUCCESS,
      currentPlanIndex: 0,
      setCurrentPlanIndex: vi.fn(),
      isBigScreen: false,
      onClose: vi.fn(),
      intl: createIntl(Locale.fr),
      ...params,
    }),
  )

const scheduleRows = () =>
  within(screen.getByTestId('modal-installments-element')).getAllByRole('listitem')

describe('modalContentTemplate', () => {
  it('should render only the shell, the skip links and the layout when the request failed', () => {
    renderContent({ status: StatusResponse.FAILED, eligiblePlans: [] })

    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navigation rapide' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-installments-element')).not.toBeInTheDocument()
  })

  it('should display the no-eligibility message', () => {
    renderContent({ eligiblePlans: [] })

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Oups, il semblerait que la simulation n'ait pas fonctionné.",
    )
  })

  it('should show the P1X title when the current plan is P1X', () => {
    renderContent({ eligiblePlans: [p1x] })

    expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
      'Payez comptant par carte bancaire avec Alma.',
    )
  })

  it('should fall back to the first plan when the index is out of range', () => {
    renderContent({ currentPlanIndex: 2 })

    expect(screen.getByRole('button', { name: /2x$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(scheduleRows()).toHaveLength(2)
  })

  it('should point each skip link at an element that exists', () => {
    renderContent()

    const navigation = screen.getByRole('navigation', { name: 'Navigation rapide' })
    const hrefs = within(navigation)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
    expect(hrefs).toHaveLength(3)
    hrefs.forEach((href) => {
      expect(document.getElementById(href?.slice(1) ?? '')).toBeInTheDocument()
    })
  })
})
