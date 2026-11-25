import { fireEvent, screen, within } from '@testing-library/dom'
import { html, render } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { mockP2XEligiblePlan, mockP3XEligiblePlanWithFees } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type PlansContentParams,
  plansContentTemplate,
} from '@/widgets/payment-plans/templates/plans-content.template'

const KNOW_MORE_NAME = 'Ouvrir les options de paiement Alma pour en savoir plus'

const p2x = mockP2XEligiblePlan as EligibilityPlanToDisplay
const p3x = mockP3XEligiblePlanWithFees as EligibilityPlanToDisplay

const params = (
  plans: EligibilityPlanToDisplay[],
  overrides: Partial<PlansContentParams> = {},
): PlansContentParams => ({
  plans,
  current: 0,
  isInfoClickable: false,
  info: html``,
  announceText: '',
  onOpenModal: () => {},
  onPlanHover: () => {},
  onPlanLeave: () => {},
  onPlanKeyDown: () => {},
  onPlanClick: () => {},
  ...overrides,
})

const renderContent = (overrides: Partial<PlansContentParams> = {}) =>
  renderTemplate(plansContentTemplate(params([p2x, p3x], overrides), createIntl('fr')))

const knowMore = () => screen.getByRole('button', { name: KNOW_MORE_NAME })

const infoLine = () => document.getElementById('payment-info-text') as HTMLElement

describe('plansContentTemplate', () => {
  it('should keep each plan button with its plan when the plans change', () => {
    const intl = createIntl('fr')
    const container = renderTemplate(plansContentTemplate(params([p2x, p3x]), intl))
    const [button2x, button3x] = container.querySelectorAll('[role="option"]')

    render(plansContentTemplate(params([p3x, p2x]), intl), container)

    expect([...container.querySelectorAll('[role="option"]')]).toEqual([button3x, button2x])
  })

  describe('structure', () => {
    it('should render the main container and the sr-only titles', () => {
      renderContent()

      const widgetContainer = screen.getByTestId('widget-container')
      expect(widgetContainer.tagName).toBe('DIV')
      expect(widgetContainer).toHaveAttribute('id', 'alma-widget-payment-plans-main-container')

      for (const id of ['payment-plans-title', 'payment-info-title']) {
        const title = document.getElementById(id)
        expect(title).toHaveClass('sr-only')
      }
    })

    it('should not render semantic HTML elements that could interfere with host pages', () => {
      const container = renderContent()

      expect(
        container.querySelector('section, aside, article, main, header, footer, nav'),
      ).not.toBeInTheDocument()
      expect(container.querySelector('h1, h2, h3, h4, h5, h6')).not.toBeInTheDocument()
    })

    it('should hide the border with hideBorder: true', () => {
      renderContent({ hideBorder: true })

      expect(screen.getByTestId('widget-container')).toHaveClass('hideBorder')
    })

    it('should keep the border with hideBorder: false', () => {
      renderContent({ hideBorder: false })

      expect(screen.getByTestId('widget-container')).not.toHaveClass('hideBorder')
    })

    it('should give the announcement region its class', () => {
      renderContent()

      const alertRegion = screen.getByRole('alert')
      expect(alertRegion).toHaveClass('announceText')
    })
  })

  describe('know-more button', () => {
    it('should render a button of type button', () => {
      renderContent()

      expect(knowMore()).toHaveAttribute('type', 'button')
    })

    it('should render the Alma logo', () => {
      renderContent()

      expect(within(knowMore()).getByTestId('Alma-Logo')).toBeInTheDocument()
    })

    it('should be monochrome with monochrome: true', () => {
      renderContent({ monochrome: true })

      expect(knowMore()).toHaveClass('monochrome')
    })

    it('should call onOpenModal on a click', () => {
      const onOpenModal = vi.fn()
      renderContent({ onOpenModal })

      fireEvent.click(knowMore())

      expect(onOpenModal).toHaveBeenCalledOnce()
    })
  })

  describe('clickable info line', () => {
    it('should call onOpenModal on a click', () => {
      const onOpenModal = vi.fn()
      renderContent({ isInfoClickable: true, onOpenModal })

      fireEvent.click(infoLine())

      expect(onOpenModal).toHaveBeenCalledOnce()
    })
  })
})
