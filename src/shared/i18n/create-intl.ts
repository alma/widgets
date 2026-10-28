import { memoize, strategies } from '@formatjs/fast-memoize'
import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { printAST } from '@formatjs/icu-messageformat-parser/lib/printer.js'
import IntlMessageFormat, { type Formatters } from 'intl-messageformat'

import messagesDE from '@/intl/messages/messages.de.json'
import messagesEN from '@/intl/messages/messages.en.json'
import messagesES from '@/intl/messages/messages.es.json'
import messagesFR from '@/intl/messages/messages.fr.json'
import messagesIT from '@/intl/messages/messages.it.json'
import messagesNL from '@/intl/messages/messages.nl.json'
import messagesPT from '@/intl/messages/messages.pt.json'
import defaultMessages from '@/intl/messages.json'
import { Locale } from '@/shared/i18n/i18n.const'
import type { IntlShape, MessageDescriptor, MessageValues } from '@/shared/i18n/i18n.types'
import { warnOnce } from '@/shared/lib/errors'

type Catalogue = Record<string, MessageFormatElement[]>

// scripts/vite-plugin-icu.ts serves the AST, but TypeScript types the JSON as strings.
const compiled = (catalogue: Record<string, string>) => catalogue as unknown as Catalogue

export const getTranslationsByLocale = (locale: string): Catalogue => {
  // A CMS plugin can send `fr-FR` instead of `fr`.
  const merchantLocale = locale.slice(0, 2)
  switch (merchantLocale) {
    case Locale.fr:
      return compiled(messagesFR)
    case Locale.es:
      return compiled(messagesES)
    case Locale.it:
      return compiled(messagesIT)
    case Locale.de:
      return compiled(messagesDE)
    case Locale.pt:
      return compiled(messagesPT)
    case Locale.nl:
      return compiled(messagesNL)
    case Locale.en:
    default:
      return compiled(messagesEN)
  }
}

// One Intl formatter per locale and option set.
const formatters: Formatters = {
  getNumberFormat: memoize(
    (...args: ConstructorParameters<typeof Intl.NumberFormat>) => new Intl.NumberFormat(...args),
    { strategy: strategies.variadic },
  ),
  getDateTimeFormat: memoize(
    (...args: ConstructorParameters<typeof Intl.DateTimeFormat>) =>
      new Intl.DateTimeFormat(...args),
    { strategy: strategies.variadic },
  ),
  getPluralRules: memoize(
    (...args: ConstructorParameters<typeof Intl.PluralRules>) => new Intl.PluralRules(...args),
    { strategy: strategies.variadic },
  ),
}

const isValidLocale = (locale: string) => {
  try {
    Intl.getCanonicalLocales(locale)
    return true
  } catch {
    return false
  }
}

const fallbackLocale = (locale: string) => {
  const language = locale.slice(0, 2)
  return Object.values<string>(Locale).includes(language) && isValidLocale(language)
    ? language
    : Locale.en
}

const formatWith = (
  cache: Map<string, IntlMessageFormat>,
  locale: string,
  id: string,
  message: MessageFormatElement[],
  values?: Record<string, unknown>,
): string | unknown[] => {
  let messageFormat = cache.get(id)
  if (!messageFormat) {
    messageFormat = new IntlMessageFormat(message, locale, undefined, { formatters })
    cache.set(id, messageFormat)
  }
  const formatted = messageFormat.format(values as MessageValues<unknown>)
  return Array.isArray(formatted) || typeof formatted === 'string' ? formatted : [formatted]
}

const defaultCatalogue = compiled(defaultMessages)
const defaultFormats = new Map<string, IntlMessageFormat>()

const createValidIntl = (locale: string): IntlShape => {
  const catalogue = getTranslationsByLocale(locale)
  const messageFormats = new Map<string, IntlMessageFormat>()

  // Like react-intl: the default message in `en`, then the message verbatim. An id missing from
  // messages.json has no compiled default, so its default message stays unformatted.
  function formatMessage(descriptor: MessageDescriptor, values?: MessageValues): string
  function formatMessage<T>(
    descriptor: MessageDescriptor,
    values: MessageValues<T>,
  ): string | Array<string | T>
  function formatMessage(
    { id, defaultMessage }: MessageDescriptor,
    values?: Record<string, unknown>,
  ): string | unknown[] {
    if (!Object.prototype.hasOwnProperty.call(catalogue, id)) {
      warnOnce(`The "${locale}" catalogue has no message "${id}". Its default message applies.`)
      return defaultMessage
    }
    const message = catalogue[id]
    try {
      return formatWith(messageFormats, locale, id, message, values)
    } catch (error) {
      warnOnce(
        `Cannot format the message "${id}" in "${locale}". Its default message applies.`,
        error,
      )
    }
    try {
      return formatWith(defaultFormats, Locale.en, id, defaultCatalogue[id], values)
    } catch (error) {
      warnOnce(`Cannot format the default message "${id}". The message applies verbatim.`, error)
      return printAST(message)
    }
  }

  return {
    locale,
    formatMessage,
    formatNumber: (value, options) => {
      try {
        return formatters.getNumberFormat(locale, options).format(value)
      } catch (error) {
        warnOnce(`Cannot format the number ${value} in "${locale}".`, error)
        return String(value)
      }
    },
    formatDate: (value, options) => {
      try {
        return formatters.getDateTimeFormat(locale, options).format(value)
      } catch (error) {
        warnOnce(`Cannot format the date ${String(value)} in "${locale}".`, error)
        return String(value)
      }
    },
  }
}

const intls = new Map<string, IntlShape>()

// Replaces IntlProvider and useIntl(). As on master, `FR` gets English texts with French formats.
// A locale that Intl rejects, such as `fr_FR`, throws on master and falls back here.
export const createIntl = (locale: string): IntlShape => {
  const cached = intls.get(locale)
  if (cached) return cached
  let intl: IntlShape
  if (isValidLocale(locale)) {
    intl = createValidIntl(locale)
  } else {
    const fallback = fallbackLocale(locale)
    warnOnce(`"${locale}" is not a valid locale. The texts and formats of "${fallback}" apply.`)
    intl = createIntl(fallback)
  }
  intls.set(locale, intl)
  return intl
}
