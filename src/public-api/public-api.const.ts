import { LIVE_API_URL, SANDBOX_API_URL } from '@/shared/config/api-url.const'

// An object, not an enum. esbuild cannot evaluate an imported constant, so an enum initialised
// from the URLs would get reverse mappings, and Alma.ApiMode would gain one key per URL.
export const ApiMode = {
  LIVE: LIVE_API_URL,
  TEST: SANDBOX_API_URL,
} as const

// The value and its type share a name, like the enum they replace.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ApiMode = (typeof ApiMode)[keyof typeof ApiMode]

export enum WidgetTypes {
  PaymentPlans = 'PaymentPlans',
  Modal = 'Modal',
}

// Frozen for 4.x: another 4.x bundle on the page may have defined these tags.
export const PAYMENT_PLANS_TAG = 'alma-payment-plans'
export const ELIGIBILITY_MODAL_TAG = 'alma-eligibility-modal'
