import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fireEvent, screen } from '@testing-library/dom'
import { render } from 'lit'
import { axe } from 'vitest-axe'

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
  it('should not have any accessibility violations', async () => {
    const { container } = renderTabs()

    expect(await axe(container)).toHaveNoViolations()
  })

  it('should render a group labelled by the section title', () => {
    renderTabs()

    const title = screen.getByRole('heading', { level: 2, name: 'Options de paiement disponibles' })
    expect(title).toHaveAttribute('id', 'payment-plans-title')
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

  it('should render one button per plan with its short name and label', () => {
    renderTabs()

    expect(planButtons().map((button) => button.textContent?.trim())).toEqual(LABELS)
    LABELS.forEach((label, index) => {
      const button = planButtons()[index]
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-describedby', 'payment-info')
      expect(button).toHaveAccessibleName(`Sélectionner le plan de paiement ${label}`)
      expect(button.querySelector('span')).toHaveClass('textButton', { exact: true })
    })
  })

  it('should mark only the active button', () => {
    renderTabs({ currentPlanIndex: 2 })

    planButtons().forEach((button, index) => {
      if (index === 2) {
        expect(button).toHaveClass('active alma-eligibility-modal-active-option', { exact: true })
        expect(button).toHaveAttribute('aria-pressed', 'true')
        expect(button).toHaveAttribute('aria-current', 'true')
        return
      }
      expect(button).not.toHaveAttribute('class')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).not.toHaveAttribute('aria-current')
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

  it('should select a plan on a click without moving focus', () => {
    const { setCurrentPlanIndex } = renderTabs()
    planButtons()[0].focus()

    fireEvent.click(planButtons()[3])

    expect(setCurrentPlanIndex).toHaveBeenCalledWith(3)
    expect(planButtons()[3]).toHaveAttribute('aria-pressed', 'true')
    expect(planButtons()[0]).toHaveFocus()
  })

  it.each([
    ['ArrowRight', 2, 3],
    ['ArrowLeft', 2, 1],
    ['Home', 2, 0],
    ['End', 2, 5],
  ])('should select and focus the plan that %s targets', async (key, from, to) => {
    const { setCurrentPlanIndex } = renderTabs({ currentPlanIndex: from })
    planButtons()[from].focus()

    const notPrevented = fireEvent.keyDown(planButtons()[from], { key })

    expect(notPrevented).toBe(false)
    expect(setCurrentPlanIndex).toHaveBeenCalledExactlyOnceWith(to)
    await vi.waitFor(() => expect(planButtons()[to]).toHaveFocus())
    expect(planButtons()[to]).toHaveAttribute('aria-pressed', 'true')
  })

  it.each([
    ['ArrowLeft', 0],
    ['ArrowRight', 5],
  ])('should not wrap on %s at the edge', (key, edge) => {
    const { setCurrentPlanIndex } = renderTabs({ currentPlanIndex: edge })

    const notPrevented = fireEvent.keyDown(planButtons()[edge], { key })

    expect(notPrevented).toBe(false)
    expect(setCurrentPlanIndex).not.toHaveBeenCalled()
  })

  it('should keep the default action of other keys', () => {
    const { setCurrentPlanIndex } = renderTabs()

    const notPrevented = fireEvent.keyDown(planButtons()[0], { key: 'Enter' })

    expect(notPrevented).toBe(true)
    expect(setCurrentPlanIndex).not.toHaveBeenCalled()
  })

  it('should not move focus when the key targets the plan already selected', async () => {
    const { setCurrentPlanIndex } = renderTabs({ currentPlanIndex: 0 })
    planButtons()[2].focus()

    fireEvent.keyDown(planButtons()[2], { key: 'Home' })
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    expect(setCurrentPlanIndex).toHaveBeenCalledWith(0)
    expect(planButtons()[2]).toHaveFocus()
  })

  it('should focus the new button only once an asynchronous host has rendered', async () => {
    renderTabs(
      {},
      (doRender) =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            doRender()
            resolve()
          }, 0)
        }),
    )
    planButtons()[0].focus()

    fireEvent.keyDown(planButtons()[0], { key: 'ArrowRight' })

    expect(planButtons()[0]).toHaveFocus()
    await vi.waitFor(() => expect(planButtons()[1]).toHaveFocus())
    expect(planButtons()[1]).toHaveAttribute('aria-pressed', 'true')
  })

  describe('short name', () => {
    it.each([
      ['2x', { installments_count: 2, deferred_days: 0, deferred_months: 0 }],
      ['12x', { installments_count: 12, deferred_days: 0, deferred_months: 0 }],
      ['Payer maintenant', { installments_count: 1, deferred_days: 0, deferred_months: 0 }],
      ['J+30', { installments_count: 1, deferred_days: 30, deferred_months: 0 }],
      ['M+1', { installments_count: 1, deferred_days: 0, deferred_months: 1 }],
      // The deferred days win over the months.
      ['J+30', { installments_count: 1, deferred_days: 30, deferred_months: 1 }],
    ])('should name the plan %s', (shortName, plan) => {
      renderPlan({ ...mockP1XEligiblePlan, ...plan }, 'fr')

      expect(screen.getByRole('button').textContent).toBe(shortName)
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
