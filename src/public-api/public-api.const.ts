export const ApiMode = {
  LIVE: 'https://api.getalma.eu',
  TEST: 'https://api.sandbox.getalma.eu',
} as const

// The value and its type share a name, like the enum they replace.
export type ApiMode = (typeof ApiMode)[keyof typeof ApiMode]

export const WidgetTypes = {
  PaymentPlans: 'PaymentPlans',
  Modal: 'Modal',
} as const

export type WidgetTypes = (typeof WidgetTypes)[keyof typeof WidgetTypes]
