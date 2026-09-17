// Fully generic mocked-plan draft machinery: PlanDraft mirrors EligiblePlan/IneligiblePlan's own
// field set (fixed by the API contract, not by any one feature), so there's no sense in which a
// feature would need fewer of these fields — copied verbatim like dom.ts/mockFetch.ts, never
// rewritten. Feature-specific quick-scenario presets and any custom summary wording stay out of
// this file — see App.ts (presets) and planSummary.ts (optional custom summarize).
import { eligiblePlanBuilder, ineligiblePlanBuilder } from '@/test/planBuilders'
import { EligibilityPlan } from '@/types'

type SharedDraftFields = {
  id: string
  installmentsCount: number
  deferredDays: number
  deferredMonths: number
  country: string
}

export type EligiblePlanDraft = SharedDraftFields & {
  eligible: true
  feeAmount: number // cents
  annualInterestRateBps: number // bps, e.g. 1720 = 17.20%
}

export type IneligiblePlanDraft = SharedDraftFields & {
  eligible: false
  minAmount: number // cents — merchant constraint the purchase amount fell outside of
  maxAmount: number // cents
  reasonCode: string
}

export type PlanDraft = EligiblePlanDraft | IneligiblePlanDraft

// 'XX' is deliberately unmapped in WarningMessage's WARNINGS_BY_COUNTRY — picking it shows the
// warning message disappearing entirely (its own "no approved wording" fallback). Kept here since
// every feature that mocks a plan needs some country list, not because it's feature-specific.
export const SUPPORTED_COUNTRIES = ['FR', 'LU', 'BE', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB', 'XX'] as const

let nextId = 1
const makeId = (): string => `draft-${nextId++}`

export const makeEligibleDraft = (installmentsCount = 3): EligiblePlanDraft => ({
  id: makeId(),
  eligible: true,
  installmentsCount,
  deferredDays: 0,
  deferredMonths: 0,
  country: 'FR',
  feeAmount: 0,
  annualInterestRateBps: 0,
})

export const makeIneligibleDraft = (installmentsCount = 12): IneligiblePlanDraft => ({
  id: makeId(),
  eligible: false,
  installmentsCount,
  deferredDays: 0,
  deferredMonths: 0,
  country: 'FR',
  minAmount: 15000,
  maxAmount: 300000,
  reasonCode: 'purchase_amount',
})

const sharedDraftFields = (draft: PlanDraft): SharedDraftFields => ({
  id: draft.id,
  installmentsCount: draft.installmentsCount,
  deferredDays: draft.deferredDays,
  deferredMonths: draft.deferredMonths,
  country: draft.country,
})

// Fills sensible defaults for the fields that appear when the eligible/ineligible switch flips a
// draft to the other variant — never carries a value over from a field that didn't exist on the
// source shape (flipping eligible→ineligible→eligible twice doesn't remember the original fee).
export const toEligibleDraft = (draft: PlanDraft): EligiblePlanDraft => ({
  ...sharedDraftFields(draft),
  eligible: true,
  feeAmount: draft.eligible ? draft.feeAmount : 0,
  annualInterestRateBps: draft.eligible ? draft.annualInterestRateBps : 0,
})

export const toIneligibleDraft = (draft: PlanDraft): IneligiblePlanDraft => ({
  ...sharedDraftFields(draft),
  eligible: false,
  minAmount: draft.eligible ? 15000 : draft.minAmount,
  maxAmount: draft.eligible ? 300000 : draft.maxAmount,
  reasonCode: draft.eligible ? 'purchase_amount' : draft.reasonCode,
})

// installmentsCount doubles as this playground's per-draft identity for merchant-plan-config
// matching (mirrors ConfigPlansEditor.ts's rows, also keyed by installments count) — two mocked
// plans sharing one count is a real, easy-to-hit input mistake worth flagging inline rather than
// silently producing a confusing response (gotcha 18).
export const isDuplicateInstallments = (drafts: PlanDraft[], draft: PlanDraft): boolean =>
  draft.installmentsCount > 0 &&
  drafts.some((other) => other.id !== draft.id && other.installmentsCount === draft.installmentsCount)

export const isValidDraft = (drafts: PlanDraft[], draft: PlanDraft): boolean =>
  draft.installmentsCount > 0 && !isDuplicateInstallments(drafts, draft)

// Order matters for the eligible chain: withInstallmentsCount needs purchase_amount set first, and
// withFees/withInterest/withDeferredMonths/withDeferredDays all need payment_plan (i.e.
// withInstallmentsCount) called before them — see planBuilders.ts's own requireStep() guards.
// purchase_amount is a parameter, not a draft field: every mocked plan shares one purchase amount
// (unit price × quantity, computed once in App.ts), the same way a real merchant's page does —
// gotcha 17.
export const draftToEligibilityPlan = (draft: PlanDraft, purchaseAmount: number): EligibilityPlan => {
  if (draft.eligible) {
    let builder = eligiblePlanBuilder()
      .withPurchaseAmount(purchaseAmount)
      .withInstallmentsCount(draft.installmentsCount)
      .withCountry(draft.country)

    if (draft.feeAmount) builder = builder.withFees(draft.feeAmount)
    if (draft.annualInterestRateBps) builder = builder.withInterest(draft.annualInterestRateBps)
    if (draft.deferredMonths) builder = builder.withDeferredMonths(draft.deferredMonths)
    if (draft.deferredDays) builder = builder.withDeferredDays(draft.deferredDays)

    return builder
  }

  // Nested under `purchase_amount` — NOT a flat { minimum, maximum } object. This is the exact
  // shape IneligiblePlan['constraints'] requires (src/types.ts) — gotcha 13, the one place a flat
  // object compiles-looking-fine under an unscoped `tsc` and is silently wrong.
  return ineligiblePlanBuilder()
    .withPurchaseAmount(purchaseAmount)
    .withInstallmentsCount(draft.installmentsCount)
    .withCountry(draft.country)
    .withConstraints({ purchase_amount: { minimum: draft.minAmount, maximum: draft.maxAmount } })
    .withReasons(draft.reasonCode ? { [draft.reasonCode]: draft.reasonCode } : {})
}

// A plain "3x · 450.00 € · FR · eligible · fee" / "...ineligible (reason)" one-liner for a card's
// collapsed summary — deliberately generic, no feature-specific category wording (DCC2's "pay
// later"/"PNX"/"credit" labels, say). Write a planSummary.ts and pass its own summarize function
// into buildResponseEditor/buildPlanDraftCard instead if a feature wants that.
export const defaultSummarizeDraft = (draft: PlanDraft, purchaseAmount: number): string => {
  if (draft.installmentsCount === 0) {
    return 'New plan — set an installments count'
  }

  const installments = `${draft.installmentsCount}x`
  const amount = `${(purchaseAmount / 100).toFixed(2)} €`

  if (!draft.eligible) {
    return [installments, amount, draft.country, `ineligible (${draft.reasonCode || 'no reason set'})`].join(' · ')
  }

  const fee = draft.feeAmount > 0 ? 'fee' : 'no fee'
  return [installments, amount, draft.country, 'eligible', fee].join(' · ')
}
