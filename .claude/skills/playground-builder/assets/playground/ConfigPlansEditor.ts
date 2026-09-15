// Editable table of merchant plan constraints — mirrors PaymentPlanWidgetOptions.plans
// (`ConfigPlan` from `@/types`) exactly. filterEligibility.ts matches mocked plans against these
// rows to decide what's shown at all (a response plan with no matching row here is hidden, P1X
// included) and, for eligible plans, whether the purchase amount is in range.
//
// This is what makes the "P1X hidden whenever no merchant plan config is passed" production
// default something the playground can actually demonstrate — leave the rows empty to see it, add
// one to see it stop applying — rather than a static callout describing it and moving on.
//
// Fully generic: this file's content never depends on the feature under test (unlike
// ConfigPanel.ts, it never needs a feature-specific field — PaymentPlanWidgetOptions.plans has a
// fixed shape), so it's copied verbatim like dom.ts/mockFetch.ts, never rewritten.
import { ConfigPlan } from '@/types'

import { el, syncList } from './dom'

type ConfigPlanRow = ConfigPlan & { id: string }

let nextRowId = 1
const makeRowId = (): string => `plan-row-${nextRowId++}`

export const makeDefaultConfigPlanRow = (installmentsCount = 3): ConfigPlanRow => ({
  id: makeRowId(),
  installmentsCount,
  deferredDays: 0,
  deferredMonths: 0,
  minAmount: 0,
  maxAmount: 1000000,
})

// Strips the local `id` field before handing rows to Widgets.add({ plans: ... }) — it's purely a
// syncList bookkeeping key, ConfigPlan itself has no such field.
export const toPlanOptions = (rows: ConfigPlanRow[]): ConfigPlan[] =>
  rows.map(({ id: _id, ...rest }) => rest)

export type ConfigPlansState = { configPlans: ConfigPlanRow[] }

export function buildConfigPlansEditor(state: ConfigPlansState, onChange: () => void): HTMLElement {
  const handles = new Map<string, HTMLTableRowElement>()
  const tbody = el('tbody')

  const numberCell = (value: number, onInput: (value: number) => void): HTMLTableCellElement => {
    const input = el('input', {
      type: 'number',
      value: String(value),
      oninput: (event: Event) => {
        const raw = Number((event.target as HTMLInputElement).value)
        onInput(Number.isFinite(raw) ? raw : 0)
      },
    })
    return el('td', {}, [input])
  }

  const emptyState = el('p', { className: 'pg-callout' }, [
    'No rows configured — the widget falls back to its own default behavior: every plan in the ',
    'response is shown as-is ',
    el('strong', {}, ['except P1X']),
    ' (1x, no deferral), which stays hidden until a matching row is added here.',
  ])
  const tableHead = el('thead', {}, [
    el('tr', {}, [
      el('th', {}, ['Installments']),
      el('th', {}, ['Min (€)']),
      el('th', {}, ['Max (€)']),
      el('th', {}, ['Deferred days']),
      el('th', {}, ['Deferred months']),
      el('th', {}, []),
    ]),
  ])
  const table = el('table', { className: 'pg-plan-table' }, [tableHead, tbody])

  const render = (): void => {
    // .hidden won't work here: .pg-callout/.pg-plan-table both set their own `display`, which
    // beats the [hidden] user-agent rule regardless of specificity (gotcha 14) — toggle
    // style.display directly instead.
    emptyState.style.display = state.configPlans.length === 0 ? '' : 'none'
    table.style.display = state.configPlans.length === 0 ? 'none' : ''

    syncList(
      tbody,
      state.configPlans,
      (row) => row.id,
      handles,
      (row) => {
        const removeButton = el(
          'button',
          {
            type: 'button',
            className: 'pg-remove-inline',
            onclick: () => {
              state.configPlans = state.configPlans.filter((r) => r.id !== row.id)
              onChange()
              render()
            },
          },
          ['✕'],
        )
        return el('tr', {}, [
          numberCell(row.installmentsCount, (value) => {
            row.installmentsCount = value
            onChange()
          }),
          numberCell(row.minAmount / 100, (value) => {
            row.minAmount = Math.round(value * 100)
            onChange()
          }),
          numberCell(row.maxAmount / 100, (value) => {
            row.maxAmount = Math.round(value * 100)
            onChange()
          }),
          numberCell(row.deferredDays ?? 0, (value) => {
            row.deferredDays = value
            onChange()
          }),
          numberCell(row.deferredMonths ?? 0, (value) => {
            row.deferredMonths = value
            onChange()
          }),
          el('td', {}, [removeButton]),
        ])
      },
      // Per gotcha 9: each cell's own input already owns its live value from the field's own
      // handler above: nothing needs to be pushed back in from outside on a resync.
      () => {},
    )
  }

  render()

  return el('details', { className: 'pg-section', open: true }, [
    el('summary', {}, ['Merchant plan config', el('span', { className: 'pg-section-chevron' })]),
    el('div', { className: 'pg-section-body' }, [
      emptyState,
      table,
      el('div', { className: 'pg-button-row' }, [
        el(
          'button',
          {
            type: 'button',
            className: 'pg-button pg-button--ghost',
            onclick: () => {
              state.configPlans = [...state.configPlans, makeDefaultConfigPlanRow()]
              onChange()
              render()
            },
          },
          ['+ Add row'],
        ),
      ]),
    ]),
  ])
}
