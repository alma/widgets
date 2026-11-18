import type { TemplateResult } from 'lit'

import type { IntlShape, MessageDescriptor, MessageValues } from '@/shared/i18n/i18n.types'

// Nests when a formatted message is the value of another, like the legal mentions' disclaimer.
export type RichText = Array<string | TemplateResult | RichText>

// Tag functions return Lit templates, so Lit escapes the translated text, unlike unsafeHTML.
export const formatRichText = (
  intl: IntlShape,
  descriptor: MessageDescriptor,
  values: MessageValues<TemplateResult | RichText>,
): RichText => {
  const formatted = intl.formatMessage(descriptor, values)
  return Array.isArray(formatted) ? formatted : [formatted]
}
