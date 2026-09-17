// Orchestrates the mocked-plan draft list: add/remove, drag-to-reorder, quick-scenario presets,
// duplicate-installments validation, response delay/error simulation, raw JSON preview. Fully
// generic — copied verbatim like dom.ts/mockFetch.ts, never rewritten. `presets` and `summarize`
// are parameters (not fixed imports) so App.ts (Step 3) supplies this feature's own quick-scenario
// buttons and, optionally, its own category-label wording.
import { el, syncList } from './dom'
import { buildPlanDraftCard, PlanDraftCardElement } from './PlanDraftCard'
import {
  draftToEligibilityPlan,
  isDuplicateInstallments,
  isValidDraft,
  makeEligibleDraft,
  PlanDraft,
} from './planDrafts'

export type ResponseState = {
  drafts: PlanDraft[]
  simulateError: boolean
  errorMessage: string
  delayMs: number
}

export type PlanPreset = { label: string; build: () => PlanDraft }

export type ResponseEditorHandle = {
  element: HTMLElement
  // purchaseAmount is computed elsewhere (unit price × quantity in App.ts) and can change without
  // any draft being edited — call this so summaries/due-dates chips stay in sync (gotcha 17).
  refresh: () => void
}

type DraftItemElement = HTMLElement & { cardRef: PlanDraftCardElement }
type DragState = { index: number | null; allowed: boolean; dragImage: HTMLElement | null }

export function buildResponseEditor(
  state: ResponseState,
  getPurchaseAmount: () => number,
  onChange: () => void,
  presets: PlanPreset[],
  summarize: (draft: PlanDraft, purchaseAmount: number) => string,
): ResponseEditorHandle {
  const handles = new Map<string, DraftItemElement>()
  const list = el('div', { className: 'pg-draft-list' })
  const jsonPreview = el('pre', { className: 'pg-json-preview' })

  // Shared across every card — only one drag can be in flight at a time (gotchas 5-6).
  let dragState: DragState = { index: null, allowed: false, dragImage: null }

  const refreshJsonPreview = (): void => {
    const purchaseAmount = getPurchaseAmount()
    const validPlans = state.drafts
      .filter((draft) => isValidDraft(state.drafts, draft))
      .map((draft) => draftToEligibilityPlan(draft, purchaseAmount))
    jsonPreview.textContent = JSON.stringify(validPlans, null, 2)
  }

  const notify = (): void => {
    onChange()
    refreshJsonPreview()
  }

  const create = (draft: PlanDraft): DraftItemElement => {
    const card = buildPlanDraftCard({
      draft,
      purchaseAmount: getPurchaseAmount(),
      isDuplicate: isDuplicateInstallments(state.drafts, draft),
      summarize,
      onFieldChange: () => {
        renderList()
        notify()
      },
      onToggleEligible: (next) => {
        state.drafts = state.drafts.map((d) => (d.id === draft.id ? next : d))
        renderList()
        notify()
      },
      onRemove: () => {
        state.drafts = state.drafts.filter((d) => d.id !== draft.id)
        renderList()
        notify()
      },
    })

    const handle = el(
      'span',
      { className: 'pg-plan-drag-handle', 'aria-label': 'Drag to reorder' },
      ['⠿'],
    )
    handle.addEventListener('mousedown', () => {
      dragState.allowed = true
    })

    const wrapper = el('div', { className: 'pg-plan-drag-item', draggable: true }, [
      handle,
      card,
    ]) as unknown as DraftItemElement
    wrapper.cardRef = card

    wrapper.addEventListener('dragstart', (event) => {
      if (!dragState.allowed) {
        event.preventDefault()
        return
      }
      dragState.index = state.drafts.findIndex((d) => d.id === draft.id)
      event.dataTransfer!.effectAllowed = 'move'
      // Clone into an isolated, off-screen node with explicit dimensions before handing it to
      // setDragImage — the live card sits inside the same stacking context as its siblings, and
      // browsers can render its automatic drag snapshot as a much bigger chunk of that context
      // than just the card (gotcha 5).
      const cardEl = wrapper.querySelector('.pg-plan-card')
      if (cardEl instanceof HTMLElement) {
        const { width, height } = cardEl.getBoundingClientRect()
        const clone = cardEl.cloneNode(true) as HTMLElement
        Object.assign(clone.style, {
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: `${width}px`,
          height: `${height}px`,
          margin: '0',
        })
        document.body.append(clone)
        event.dataTransfer!.setDragImage(clone, 16, 16)
        dragState.dragImage = clone
      }
    })
    wrapper.addEventListener('dragenter', () => {
      wrapper.classList.add('pg-plan-drag-item--over')
    })
    wrapper.addEventListener('dragleave', () => {
      wrapper.classList.remove('pg-plan-drag-item--over')
    })
    wrapper.addEventListener('dragover', (event) => {
      event.preventDefault()
    })
    wrapper.addEventListener('drop', (event) => {
      event.preventDefault()
      wrapper.classList.remove('pg-plan-drag-item--over')
      // Live lookup, not a captured index — the list may have reordered since dragstart (gotcha 7).
      const dropIndex = state.drafts.findIndex((d) => d.id === draft.id)
      if (dragState.index !== null && dragState.index !== dropIndex) {
        const next = [...state.drafts]
        const [moved] = next.splice(dragState.index, 1)
        next.splice(dropIndex, 0, moved)
        state.drafts = next
        renderList()
        notify()
      }
    })
    wrapper.addEventListener('dragend', () => {
      dragState.dragImage?.remove()
      dragState = { index: null, allowed: false, dragImage: null }
    })

    return wrapper
  }

  const update = (node: DraftItemElement, draft: PlanDraft): void => {
    node.cardRef.refresh({
      draft,
      purchaseAmount: getPurchaseAmount(),
      isDuplicate: isDuplicateInstallments(state.drafts, draft),
    })
  }

  const renderList = (): void => {
    syncList(list, state.drafts, (draft) => draft.id, handles, create, update)
  }

  const addBlankButton = el(
    'button',
    {
      type: 'button',
      className: 'pg-button pg-button--primary',
      onclick: () => {
        // installmentsCount 0 opens the card expanded, like a form waiting to be filled in
        // (gotcha 10's `<details open>` initial-state pattern).
        state.drafts = [...state.drafts, makeEligibleDraft(0)]
        renderList()
        notify()
      },
    },
    ['+ Add plan'],
  )

  const presetButtons = presets.map((preset) =>
    el(
      'button',
      {
        type: 'button',
        className: 'pg-button pg-button--ghost',
        onclick: () => {
          state.drafts = [...state.drafts, preset.build()]
          renderList()
          notify()
        },
      },
      [`+ ${preset.label}`],
    ),
  )

  const delayInput = el('input', {
    type: 'number',
    min: '0',
    value: String(state.delayMs),
    oninput: (event: Event) => {
      const raw = Number((event.target as HTMLInputElement).value)
      state.delayMs = Number.isFinite(raw) && raw >= 0 ? raw : 0
      notify()
    },
  })

  const errorToggle = el('input', {
    type: 'checkbox',
    checked: state.simulateError,
    onchange: (event: Event) => {
      state.simulateError = (event.target as HTMLInputElement).checked
      notify()
    },
  })

  jsonPreview.hidden = true
  const jsonToggleButton = el(
    'button',
    {
      type: 'button',
      className: 'pg-button pg-button--ghost',
      onclick: () => {
        jsonPreview.hidden = !jsonPreview.hidden
        jsonToggleButton.textContent = jsonPreview.hidden ? 'Show raw response JSON' : 'Hide raw response JSON'
      },
    },
    ['Show raw response JSON'],
  )

  renderList()
  refreshJsonPreview()

  const element = el('details', { className: 'pg-section', open: true }, [
    el('summary', {}, ['Mocked eligibility response', el('span', { className: 'pg-section-chevron' })]),
    el('div', { className: 'pg-section-body' }, [
      el('p', { className: 'pg-subheading' }, ['Add a plan']),
      el('div', { className: 'pg-button-row' }, [addBlankButton]),
      el('p', { className: 'pg-subheading' }, ['Quick scenarios']),
      el('div', { className: 'pg-button-row' }, presetButtons),
      list,
      el('p', { className: 'pg-subheading' }, ['Response behavior']),
      el('div', { className: 'pg-field' }, [el('label', {}, ['Response delay (ms)']), delayInput]),
      el('div', { className: 'pg-toggle-row' }, [
        errorToggle,
        el('label', {}, ['Simulate API failure (ignores the plans above, returns an error response)']),
      ]),
      el('p', { className: 'pg-subheading' }, ['Debug']),
      el('div', { className: 'pg-button-row' }, [jsonToggleButton]),
      jsonPreview,
    ]),
  ])

  return {
    element,
    refresh: () => {
      renderList()
      refreshJsonPreview()
    },
  }
}
