// Widget-level config shown in ConfigPanel.ts: locale + purchase amount. Both are read by
// virtually every widget feature — locale drives every react-intl string, purchase amount drives
// filterEligibility.ts's per-plan amount-range check against ConfigPlansEditor.ts's rows — so
// this file is copied verbatim like dom.ts/mockFetch.ts, not rewritten per feature. Add a field
// here (and to ConfigPanel.ts) only if Step 1 finds a real code path reading some other
// widget-level option beyond these two (e.g. merchantCoversAllFees, customerBillingCountry) —
// don't add one "just in case" (see SKILL.md Step 3).
import { ApiMode } from '@/consts'
import { Locale } from '@/types'

export type HarnessConfig = {
  merchantId: string
  domain: ApiMode
  locale: Locale
  purchaseAmount: number // cents
}

export const DEFAULT_CONFIG: HarnessConfig = {
  merchantId: 'playground-merchant',
  domain: ApiMode.TEST,
  locale: Locale.fr,
  purchaseAmount: 45000,
}
