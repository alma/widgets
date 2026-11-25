import { fireEvent, screen } from '@testing-library/dom'
import { html } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { mockP2XEligiblePlan, mockP3XEligiblePlanWithFees } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type PlansContentParams,
  plansContentTemplate,
  plansLoadingTemplate,
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
  describe('structure', () => {
    it('should render two regions, each labelled by its heading', () => {
      renderContent()

      expect(screen.getAllByRole('region')).toHaveLength(2)
      const paymentPlansRegion = screen.getByRole('region', {
        name: 'Options de paiement disponibles',
      })
      expect(paymentPlansRegion).toHaveAttribute('aria-labelledby', 'payment-plans-title')
      const paymentInfoRegion = screen.getByRole('region', {
        name: /Informations sur le plan de paiement/,
      })
      expect(paymentInfoRegion).toHaveAttribute('aria-labelledby', 'payment-info-title')
      expect(paymentPlansRegion.contains(paymentInfoRegion)).toBe(false)
      expect(paymentInfoRegion.contains(paymentPlansRegion)).toBe(false)

      for (const id of ['payment-plans-title', 'payment-info-title']) {
        const title = document.getElementById(id)
        expect(title).toHaveAttribute('role', 'heading')
        expect(title).toHaveAttribute('aria-level', '2')
      }
    })

    it('should render only two regions and two headings', () => {
      renderContent()

      expect(screen.getAllByRole('region')).toHaveLength(2)
      expect(screen.getAllByRole('heading')).toHaveLength(2)
    })

    it('should label the listbox of the plans', () => {
      renderContent()

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Options de paiement disponibles',
      )
    })

    it('should render an assertive alert region for the announcements', () => {
      renderContent()

      const alertRegion = screen.getByRole('alert')
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('know-more button', () => {
    it('should open a dialog and be described by the info line', () => {
      renderContent({ info: html`<p>Payer maintenant 450,00 €</p>` })

      const button = knowMore()
      expect(button).toHaveAttribute('aria-haspopup', 'dialog')
      expect(button).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(infoLine()).toHaveTextContent('Payer maintenant 450,00 €')
    })

    it.each(['Enter', ' '])('should call onOpenModal and prevent the default for %j', (key) => {
      const onOpenModal = vi.fn()
      renderContent({ onOpenModal })

      expect(fireEvent.keyDown(knowMore(), { key })).toBe(false)
      expect(onOpenModal).toHaveBeenCalledOnce()
    })

    it('should ignore other keys', () => {
      const onOpenModal = vi.fn()
      renderContent({ onOpenModal })

      expect(fireEvent.keyDown(knowMore(), { key: 'a' })).toBe(true)
      expect(onOpenModal).not.toHaveBeenCalled()
    })
  })

  describe('clickable info line', () => {
    it('should expose the info line as a button that opens a dialog', () => {
      renderContent({ isInfoClickable: true })

      expect(infoLine()).toHaveAttribute('role', 'button')
      expect(infoLine()).toHaveAttribute('tabindex', '0')
      expect(infoLine()).toHaveAttribute('aria-haspopup', 'dialog')
    })

    it.each<[string, (element: Element) => void]>([
      ['Enter', (element) => fireEvent.keyDown(element, { key: 'Enter' })],
      ['Space', (element) => fireEvent.keyDown(element, { key: ' ' })],
    ])('should call onOpenModal on %s', (_name, activate) => {
      const onOpenModal = vi.fn()
      renderContent({ isInfoClickable: true, onOpenModal })

      activate(infoLine())

      expect(onOpenModal).toHaveBeenCalledOnce()
    })
  })
})

describe('plansLoadingTemplate', () => {
  it('should render no alert region', () => {
    renderTemplate(plansLoadingTemplate())

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
