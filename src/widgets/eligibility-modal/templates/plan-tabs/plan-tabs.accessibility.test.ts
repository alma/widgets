import { fireEvent, screen } from '@testing-library/dom'
import { render } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockDisplayPlansAllEligible } from '@/test/fixtures/plans'
import {
  type PlanTabsParams,
  planTabsTemplate,
} from '@/widgets/eligibility-modal/templates/plan-tabs/plan-tabs.template'

const intl = createIntl(Locale.fr)

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
    expect(
      screen.getByRole('group', { name: 'Options de paiement disponibles' }),
    ).toBeInTheDocument()
  })

  it('should name each plan button and describe it by the info region', () => {
    renderTabs()

    LABELS.forEach((label, index) => {
      const button = planButtons()[index]
      expect(button).toHaveAttribute('aria-describedby', 'payment-info')
      expect(button).toHaveAccessibleName(`Sélectionner le plan de paiement ${label}`)
    })
  })

  it('should mark only the active button as pressed and current', () => {
    renderTabs({ currentPlanIndex: 2 })

    planButtons().forEach((button, index) => {
      if (index === 2) {
        expect(button).toHaveAttribute('aria-pressed', 'true')
        expect(button).toHaveAttribute('aria-current', 'true')
        return
      }
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).not.toHaveAttribute('aria-current')
    })
  })

  it('should press the clicked plan without moving focus', () => {
    renderTabs()
    planButtons()[0].focus()

    fireEvent.click(planButtons()[3])

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
})
