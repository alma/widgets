import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fireEvent, screen } from '@testing-library/dom'
import { render } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockDisplayPlansAllEligible,
  mockP1XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type PlanTabsParams,
  planTabsTemplate,
} from '@/widgets/eligibility-modal/templates/plan-tabs/plan-tabs.template'

const intl = createIntl(Locale.fr)

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// The fixture's text for a message, with each [placeholder] replaced by its value.
const fixtureText = (locale: string, id: string, values: Record<string, string> = {}) =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`[${name}]`, value),
    locales[locale].messages[id] as string,
  )

const renderPlan = (plan: EligibilityPlanToDisplay, locale: string) =>
  renderTemplate(
    planTabsTemplate({
      eligibilityPlans: [plan],
      currentPlanIndex: 0,
      setCurrentPlanIndex: vi.fn(),
      intl: createIntl(locale),
    }),
  )

const LABELS = ['Payer maintenant', 'M+1', '2x', '3x', '4x', '10x']

type Overrides = Partial<Omit<PlanTabsParams, 'intl' | 'setCurrentPlanIndex'>>

// Plays the host: each selection renders the template again, synchronously by default.
const renderTabs = (
  overrides: Overrides = {},
  rerender: (doRender: () => void) => void | Promise<unknown> = (doRender) => doRender(),
) => {
  const container = document.createElement('div')
  document.body.append(container)
  const setCurrentPlanIndex = vi.fn()
  const renderAt = (currentPlanIndex: number): void => {
    setCurrentPlanIndex.mockImplementation((index: number) => rerender(() => renderAt(index)))
    render(
      planTabsTemplate({
        eligibilityPlans: mockDisplayPlansAllEligible,
        id: 'payment-plans',
        ...overrides,
        currentPlanIndex,
        setCurrentPlanIndex,
        intl,
      }),
      container,
    )
  }
  renderAt(overrides.currentPlanIndex ?? 0)
  return { container, setCurrentPlanIndex }
}

const planButtons = () => screen.getAllByRole('button')

describe('planTabsTemplate', () => {
  it('should give the title and the group their classes, and the group its ID', () => {
    renderTabs()

    const title = screen.getByRole('heading', { level: 2, name: 'Options de paiement disponibles' })
    expect(title).toHaveClass('sr-only', { exact: true })
    const group = screen.getByRole('group', { name: 'Options de paiement disponibles' })
    expect(group).toHaveAttribute('id', 'payment-plans')
    expect(group).toHaveClass('buttons alma-eligibility-modal-eligibility-options', {
      exact: true,
    })
  })

  it('should render no id on the group when none is given', () => {
    renderTabs({ id: undefined })

    expect(screen.getByRole('group')).not.toHaveAttribute('id')
  })

  it('should render one button per plan with its short name', () => {
    renderTabs()

    expect(planButtons().map((button) => button.textContent?.trim())).toEqual(LABELS)
    LABELS.forEach((_label, index) => {
      const button = planButtons()[index]
      expect(button).toHaveAttribute('type', 'button')
      expect(button.querySelector('span')).toHaveClass('textButton', { exact: true })
    })
  })

  it('should give only the active button its classes', () => {
    renderTabs({ currentPlanIndex: 2 })

    planButtons().forEach((button, index) => {
      if (index === 2) {
        expect(button).toHaveClass('active alma-eligibility-modal-active-option', { exact: true })
        return
      }
      expect(button).not.toHaveAttribute('class')
    })
  })

  it('should drop the class of a button that loses the active state', () => {
    renderTabs()

    fireEvent.click(planButtons()[1])

    expect(planButtons()[0]).not.toHaveAttribute('class')
    expect(planButtons()[1]).toHaveClass('active alma-eligibility-modal-active-option', {
      exact: true,
    })
  })

  it('should select a plan on a click', () => {
    const { setCurrentPlanIndex } = renderTabs()

    fireEvent.click(planButtons()[3])

    expect(setCurrentPlanIndex).toHaveBeenCalledWith(3)
  })

  describe('short name', () => {
    // The deferred days win over the months.
    it('should name the plan J+30', () => {
      renderPlan({ ...mockP1XEligiblePlan, deferred_days: 30, deferred_months: 1 }, 'fr')

      expect(screen.getByRole('button').textContent).toBe('J+30')
    })

    describe.each(['fr', 'en'])('in %s', (locale) => {
      it.each([
        ['pay now', mockP1XEligiblePlan, 'payment-plan-strings.pay.now.button', {}],
        [
          'deferred days',
          mockPayLater30DaysEligiblePlan,
          'payment-plan-strings.day-abbreviation',
          { deferredDays: '+30' },
        ],
        [
          'deferred months',
          mockPayLaterOneMonthEligiblePlan,
          'payment-plan-strings.month-abbreviation',
          { deferredMonths: '+1' },
        ],
      ])('should name a %s plan as the message fixture does', (_kind, plan, id, values) => {
        renderPlan(plan, locale)

        expect(screen.getByRole('button').textContent).toBe(fixtureText(locale, id, values))
      })
    })
  })
})
