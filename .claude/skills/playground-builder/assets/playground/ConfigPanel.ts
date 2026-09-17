// Builds the "Widget" config section: locale + purchase amount, the two globals nearly every
// feature's rendering depends on. Copied as a starting point, not purely verbatim like
// dom.ts/mockFetch.ts/harnessConfig.ts: if Step 1 finds a real code path reading some other
// widget-level option, add a field for it here too — but only then (see SKILL.md Step 3).
//
// Mutates `config` in place and calls `onChange` — the same pattern ResponseEditor.ts and
// PlanDraftCard.ts use, not a React-style setState callback (there's no framework here to diff
// against, see references/gotchas.md's intro).
import { Locale } from '@/types'

import { el } from './dom'
import { HarnessConfig } from './harnessConfig'

export function buildConfigPanel(config: HarnessConfig, onChange: () => void): HTMLElement {
  const localeSelect = el(
    'select',
    {
      onchange: (event: Event) => {
        config.locale = (event.target as HTMLSelectElement).value as Locale
        onChange()
      },
    },
    Object.values(Locale).map((locale) =>
      el('option', { value: locale, selected: locale === config.locale }, [locale]),
    ),
  )

  const purchaseAmountInput = el('input', {
    type: 'number',
    min: '0',
    step: '1',
    value: String(config.purchaseAmount / 100),
    oninput: (event: Event) => {
      const raw = Number((event.target as HTMLInputElement).value)
      config.purchaseAmount = Number.isFinite(raw) ? Math.round(raw * 100) : 0
      onChange()
    },
  })

  return el('details', { className: 'pg-section', open: true }, [
    el('summary', {}, ['Widget', el('span', { className: 'pg-section-chevron' })]),
    el('div', { className: 'pg-section-body' }, [
      el('label', { className: 'pg-field' }, ['Locale', localeSelect]),
      el('label', { className: 'pg-field' }, ['Unit price (€)', purchaseAmountInput]),
    ]),
  ])
}
