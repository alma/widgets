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
