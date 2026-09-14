// Builds one collapsible card per mocked plan draft. Fully generic — eligible/ineligible toggle,
// per-variant fields, due-dates chip row, and duplicate/required validation are all baseline now
// (see SKILL.md Step 3), so this is copied verbatim like dom.ts/mockFetch.ts, never rewritten.
//
// Deliberately uses an options-object signature, unlike this codebase's simpler 2-arg builders,
// because there are enough independent inputs — draft, purchaseAmount, isDuplicate, summarize,
// three callbacks — that positional args would be easy to mix up.
import { el } from './dom'
import { formatDueDate } from './formatDueDate'
import {
  draftToEligibilityPlan,
  EligiblePlanDraft,
  IneligiblePlanDraft,
  PlanDraft,
  SUPPORTED_COUNTRIES,
  toEligibleDraft,
  toIneligibleDraft,
} from './planDrafts'

export type PlanDraftCardElement = HTMLElement & {
  refresh: (next: { draft: PlanDraft; purchaseAmount: number; isDuplicate: boolean }) => void
}

export type PlanDraftCardOptions = {
  draft: PlanDraft
  purchaseAmount: number
  isDuplicate: boolean
  summarize: (draft: PlanDraft, purchaseAmount: number) => string
  onFieldChange: () => void
  onToggleEligible: (next: PlanDraft) => void
  onRemove: () => void
}

const numberField = (
  label: string,
  value: number,
  onInput: (value: number) => void,
  invalid = false,
): HTMLElement => {
  const input = el('input', {
    type: 'number',
    className: invalid ? 'pg-field-invalid' : '',
    value: String(value),
    oninput: (event: Event) => {
      const raw = Number((event.target as HTMLInputElement).value)
      onInput(Number.isFinite(raw) ? raw : 0)
    },
  })
  return el('label', {}, [label, input])
}

const countryField = (draft: PlanDraft, onEdit: () => void): HTMLElement => {
  const select = el(
    'select',
    {
      onchange: (event: Event) => {
        draft.country = (event.target as HTMLSelectElement).value
        onEdit()
      },
    },
    SUPPORTED_COUNTRIES.map((code) =>
      el('option', { value: code, selected: code === draft.country }, [code]),
    ),
  )
  return el('label', {}, ['Transaction country', select])
}

// Reuses draftToEligibilityPlan — the exact function the mocked response itself calls — so these
// dates can never drift from what the widget actually fetches (gotcha 19).
const buildDueDatesChipRow = (draft: EligiblePlanDraft, purchaseAmount: number): HTMLElement => {
  const plan = draftToEligibilityPlan(draft, purchaseAmount)
  const dueDates = plan.eligible ? plan.payment_plan.map((installment) => installment.due_date) : []
  return el('div', { className: 'pg-chip-row' }, [
    el('span', { className: 'pg-chip-row-label' }, ['Due dates']),
    ...dueDates.map((dueDate) => el('span', { className: 'pg-chip' }, [formatDueDate(dueDate)])),
  ])
}

const buildEligibleFieldsGrid = (
  draft: EligiblePlanDraft,
  purchaseAmount: number,
  installmentsError: string,
  onEdit: () => void,
): HTMLElement => {
  const installmentsField = numberField(
    'Installments count',
    draft.installmentsCount,
    (value) => {
      draft.installmentsCount = value
      onEdit()
    },
    Boolean(installmentsError),
  )
  if (installmentsError) {
    installmentsField.append(el('span', { className: 'pg-field-error' }, [installmentsError]))
  }

  return el('div', {}, [
    el('div', { className: 'pg-plan-grid' }, [
      installmentsField,
      numberField('Fee (cents)', draft.feeAmount, (value) => {
        draft.feeAmount = value
        onEdit()
      }),
      numberField('Annual interest rate (bps)', draft.annualInterestRateBps, (value) => {
        draft.annualInterestRateBps = value
        onEdit()
      }),
      numberField('Deferred days', draft.deferredDays, (value) => {
        draft.deferredDays = value
        onEdit()
      }),
      numberField('Deferred months', draft.deferredMonths, (value) => {
        draft.deferredMonths = value
        onEdit()
      }),
      countryField(draft, onEdit),
    ]),
    draft.installmentsCount > 0 ? buildDueDatesChipRow(draft, purchaseAmount) : el('div', {}, []),
  ])
}

const buildIneligibleFieldsGrid = (
  draft: IneligiblePlanDraft,
  installmentsError: string,
  onEdit: () => void,
): HTMLElement => {
  const installmentsField = numberField(
    'Installments count',
    draft.installmentsCount,
    (value) => {
      draft.installmentsCount = value
      onEdit()
    },
    Boolean(installmentsError),
  )
  if (installmentsError) {
    installmentsField.append(el('span', { className: 'pg-field-error' }, [installmentsError]))
  }

  return el('div', { className: 'pg-plan-grid' }, [
    installmentsField,
    numberField('Constraint min (€)', draft.minAmount / 100, (value) => {
      draft.minAmount = Math.round(value * 100)
      onEdit()
    }),
    numberField('Constraint max (€)', draft.maxAmount / 100, (value) => {
      draft.maxAmount = Math.round(value * 100)
      onEdit()
    }),
    el('label', {}, [
      'Reason code',
      el('input', {
        type: 'text',
        value: draft.reasonCode,
        oninput: (event: Event) => {
          draft.reasonCode = (event.target as HTMLInputElement).value
          onEdit()
        },
      }),
    ]),
    countryField(draft, onEdit),
  ])
}

const computeInstallmentsError = (draft: PlanDraft, isDuplicate: boolean): string =>
  draft.installmentsCount === 0
    ? 'Required'
    : isDuplicate
      ? `${draft.installmentsCount} installments already used by another plan`
      : ''

export function buildPlanDraftCard(options: PlanDraftCardOptions): PlanDraftCardElement {
  let draft = options.draft
  let purchaseAmount = options.purchaseAmount
  let isDuplicate = options.isDuplicate
  let lastGridKey = '' // deliberately impossible so the first refresh() call always builds the grid

  const onEdit = (): void => {
    refreshDisplay()
    options.onFieldChange()
  }

  const gridContainer = el('div', {})
  const rebuildGrid = (): void => {
    const installmentsError = computeInstallmentsError(draft, isDuplicate)
    gridContainer.replaceChildren(
      draft.eligible
        ? buildEligibleFieldsGrid(draft, purchaseAmount, installmentsError, onEdit)
        : buildIneligibleFieldsGrid(draft, installmentsError, onEdit),
    )
  }

  const statusPill = el('span', { className: 'pg-pill' }, [''])
  const summaryText = el('span', { className: 'pg-plan-summary-text' }, [''])
  const errorPill = el('span', { className: 'pg-pill pg-pill--error' }, ['!'])

  const refreshDisplay = (): void => {
    summaryText.textContent = options.summarize(draft, purchaseAmount)
    statusPill.className = `pg-pill ${draft.eligible ? 'pg-pill--eligible' : 'pg-pill--ineligible'}`
    statusPill.textContent = draft.eligible ? 'Eligible' : 'Ineligible'
    // .pg-pill sets its own `display`, so .hidden can't override the [hidden] UA rule here —
    // toggle style.display directly (gotcha 14).
    errorPill.style.display = computeInstallmentsError(draft, isDuplicate) ? '' : 'none'
  }

  const switchInput = el('input', {
    type: 'checkbox',
    checked: draft.eligible,
    onchange: (event: Event) => {
      const next = (event.target as HTMLInputElement).checked ? toEligibleDraft(draft) : toIneligibleDraft(draft)
      options.onToggleEligible(next)
    },
  })

  const removeButton = el(
    'button',
    { type: 'button', className: 'pg-remove', 'aria-label': 'Remove plan', onclick: options.onRemove },
    ['✕'],
  )

  const summary = el('summary', {}, [
    statusPill,
    summaryText,
    errorPill,
    el('span', { className: 'pg-section-chevron' }),
  ])

  const switchLabel = el('label', { className: 'pg-switch-label' }, [
    'eligible',
    el('span', { className: 'pg-switch' }, [switchInput, el('span', { className: 'pg-switch-track' })]),
  ])

  const details = el('details', { className: 'pg-plan-card-details', open: draft.installmentsCount === 0 }, [
    summary,
    el('div', { className: 'pg-plan-card-body' }, [switchLabel, gridContainer]),
  ])

  const card = el('div', { className: 'pg-plan-card' }, [removeButton, details]) as unknown as PlanDraftCardElement

  card.refresh = (next): void => {
    draft = next.draft
    purchaseAmount = next.purchaseAmount
    isDuplicate = next.isDuplicate

    card.className = `pg-plan-card ${draft.eligible ? 'pg-plan-card--eligible' : 'pg-plan-card--ineligible'}`
    switchInput.checked = draft.eligible

    // Only the eligible/ineligible flag and purchase amount actually change what the grid should
    // render — a plain field edit inside the *current* grid never rebuilds it (per gotcha 9, that
    // grid's own inputs already own their live values).
    const gridKey = `${draft.eligible}:${purchaseAmount}`
    if (gridKey !== lastGridKey) {
      lastGridKey = gridKey
      rebuildGrid()
    }

    refreshDisplay()
  }
  card.refresh({ draft, purchaseAmount, isDuplicate })

  return card
}
