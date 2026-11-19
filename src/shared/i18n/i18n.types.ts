import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'

export type MessageDescriptor = {
  id: string
  defaultMessage: string
}

// T is what a rich-text tag function returns, such as a Lit template.
export type MessageValues<T = never> = Record<
  string,
  PrimitiveType | T | FormatXMLElementFn<T, string | T>
>

export type IntlShape = {
  locale: string
  formatMessage: {
    (descriptor: MessageDescriptor, values?: MessageValues): string
    <T>(descriptor: MessageDescriptor, values: MessageValues<T>): string | Array<string | T>
  }
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (value: number | Date, options?: Intl.DateTimeFormatOptions) => string
}
