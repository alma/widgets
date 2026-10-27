import type { MessageDescriptor } from '@/shared/i18n/i18n.types'

// `formatjs extract` matches this call by name. Call it unrenamed, with literal ids and messages.
export const defineMessages = <T extends Record<string, MessageDescriptor>>(messages: T): T =>
  messages
