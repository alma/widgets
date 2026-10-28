import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import messagesDE from '@/intl/messages/messages.de.json'
import messagesEN from '@/intl/messages/messages.en.json'
import messagesES from '@/intl/messages/messages.es.json'
import messagesFR from '@/intl/messages/messages.fr.json'
import messagesIT from '@/intl/messages/messages.it.json'
import messagesNL from '@/intl/messages/messages.nl.json'
import messagesPT from '@/intl/messages/messages.pt.json'
import { createIntl, getTranslationsByLocale } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import type { MessageValues } from '@/shared/i18n/i18n.types'
import { planStringsMessages } from '@/widgets/common/plan.messages'
import { legalMentionsMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'

type MessageSpec = {
  defaultMessage: string
  numericArguments: string[]
  textArguments: string[]
  tags: string[]
}
type CallSite = {
  id: string
  call: 'formatNumber' | 'formatDate'
  options: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions
  inputs: number[]
}
type Output = string | Record<string, string>
type LocaleEntry = {
  catalogue: string
  throws?: string
  messages?: Record<string, Output>
  callSites?: Record<string, Record<string, string>>
}
type MessageFixture = {
  inputs: { pluralValues: number[]; messages: Record<string, MessageSpec>; callSites: CallSite[] }
  locales: Record<string, LocaleEntry>
}

const fixture: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)
const { inputs, locales } = fixture

// Raw texts: the imported catalogues hold compiled messages.
const italianTexts: Record<string, string> = JSON.parse(
  readFileSync(resolve(__dirname, '../../intl/messages/messages.it.json'), 'utf8'),
)

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ')

// The values of scripts/generate-message-fixture.mjs.
const valuesOf = (spec: MessageSpec, numericValue?: number): MessageValues<string> => ({
  ...Object.fromEntries(spec.textArguments.map((name) => [name, `[${name}]`])),
  ...Object.fromEntries(spec.numericArguments.map((name) => [name, numericValue])),
  ...Object.fromEntries(
    spec.tags.map((tag) => [tag, (chunks: string[]) => `<${tag}>${chunks.join('')}</${tag}>`]),
  ),
})

const format = (locale: string, id: string, numericValue?: number) => {
  const spec = inputs.messages[id]
  // Not inline, or `formatjs extract` would try to read it.
  const descriptor = { id, defaultMessage: spec.defaultMessage }
  const output = createIntl(locale).formatMessage<string>(descriptor, valuesOf(spec, numericValue))
  return normalize(Array.isArray(output) ? output.join('') : output)
}

const normalizeOutput = (output: Output) =>
  typeof output === 'string'
    ? normalize(output)
    : Object.fromEntries(Object.entries(output).map(([value, text]) => [value, normalize(text)]))

const formatLike = (locale: string, id: string, expected: Output) =>
  typeof expected === 'string'
    ? format(locale, id)
    : Object.fromEntries(inputs.pluralValues.map((value) => [value, format(locale, id, value)]))

const callSitesOf = (locale: string) =>
  Object.fromEntries(
    inputs.callSites.map(({ id, call, options, inputs: values }) => [
      id,
      Object.fromEntries(
        values.map((value) => [value, normalize(createIntl(locale)[call](value, options))]),
      ),
    ]),
  )

const expectedCallSites = (entry: LocaleEntry) =>
  Object.fromEntries(
    Object.entries(entry.callSites ?? {}).map(([id, byInput]) => [
      id,
      Object.fromEntries(Object.entries(byInput).map(([value, text]) => [value, normalize(text)])),
    ]),
  )

// `xx` formats with the process's default locale, which was en-US for the fixture.
const defaultLocaleIsFixtures = new Intl.NumberFormat().resolvedOptions().locale === 'en-US'
const formattingTags = Object.entries(locales).filter(([, entry]) => !entry.throws)
const throwingTags = Object.entries(locales).filter(([, entry]) => entry.throws)

describe('getTranslationsByLocale', () => {
  it.each([
    [Locale.en, messagesEN],
    [Locale.fr, messagesFR],
    [Locale['fr-FR'], messagesFR],
    [Locale.de, messagesDE],
    [Locale['de-DE'], messagesDE],
    [Locale.es, messagesES],
    [Locale['es-ES'], messagesES],
    [Locale.it, messagesIT],
    [Locale['it-IT'], messagesIT],
    [Locale.pt, messagesPT],
    [Locale['pt-PT'], messagesPT],
    [Locale.nl, messagesNL],
    [Locale['nl-NL'], messagesNL],
    [Locale['nl-BE'], messagesNL],
  ])('should return the catalogue of the language of %s', (locale, catalogue) => {
    expect(getTranslationsByLocale(locale)).toBe(catalogue)
  })

  it('should read the language of a locale that a CMS plugin sends in LCID format', () => {
    expect(getTranslationsByLocale('fr-CA')).toBe(messagesFR)
  })

  it('should fall back to English for a language it has no catalogue for', () => {
    expect(getTranslationsByLocale('ja')).toBe(messagesEN)
  })

  it('should match the language case-sensitively, like master', () => {
    expect(getTranslationsByLocale('FR')).toBe(messagesEN)
  })
})

describe('createIntl', () => {
  describe.each(formattingTags)('for the tag %s', (tag, entry) => {
    const skipped = tag === 'xx' && !defaultLocaleIsFixtures

    it.skipIf(skipped)("formats every message like master's react-intl", () => {
      const expected = entry.messages ?? {}
      const actual = Object.fromEntries(
        Object.entries(expected).map(([id, output]) => [id, formatLike(tag, id, output)]),
      )

      expect(actual).toEqual(
        Object.fromEntries(Object.entries(expected).map(([id, out]) => [id, normalizeOutput(out)])),
      )
    })

    it.skipIf(skipped)(
      "formats the numbers and dates of master's call sites like react-intl",
      () => {
        expect(callSitesOf(tag)).toEqual(expectedCallSites(entry))
      },
    )

    it('keeps the full locale', () => {
      expect(createIntl(tag).locale).toBe(tag)
    })
  })

  describe.each(throwingTags)('for the tag %s, which throws on master', (tag) => {
    const fallback = locales[tag.slice(0, 2)] ? tag.slice(0, 2) : 'en'

    it(`formats like ${fallback} and warns once`, () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const intl = createIntl(tag)
      const messages = Object.fromEntries(
        Object.entries(locales[fallback].messages ?? {}).map(([id, output]) => [
          id,
          formatLike(tag, id, output),
        ]),
      )

      expect(intl.locale).toBe(fallback)
      expect(messages).toEqual(
        Object.fromEntries(
          Object.entries(locales[fallback].messages ?? {}).map(([id, output]) => [
            id,
            normalizeOutput(output),
          ]),
        ),
      )
      expect(callSitesOf(tag)).toEqual(expectedCallSites(locales[fallback]))
      expect(warn).toHaveBeenCalledExactlyOnceWith(
        `[Alma widgets] "${tag}" is not a valid locale. The texts and formats of "${fallback}" apply.`,
      )
    })
  })

  it('falls back to en for an invalid locale whose two letters have no catalogue', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(createIntl('x_Y').locale).toBe('en')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('returns the default message of an id that the catalogue lacks, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Not a literal, or `formatjs extract` would add it to messages.json.
    const unknown = { ...legalMentionsMessages.disclaimer, id: 'unknown.id' }

    const output = createIntl('en').formatMessage(unknown)

    expect(output).toBe(unknown.defaultMessage)
    expect(warn).toHaveBeenCalledExactlyOnceWith(
      '[Alma widgets] The "en" catalogue has no message "unknown.id". Its default message applies.',
    )
  })

  it('returns an id that is only an inherited property as missing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const inherited = { ...legalMentionsMessages.disclaimer, id: 'constructor' }

    expect(createIntl('en').formatMessage(inherited)).toBe(inherited.defaultMessage)
  })

  it('returns the message verbatim when it and its default message fail, like react-intl', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const descriptor = planStringsMessages.deferredDays
    const { id } = descriptor

    // No plural value, so both messages throw.
    const output = createIntl('it').formatMessage(descriptor)

    // Printed from the AST, so only the spacing differs from the catalogue.
    expect(output.replace(/\s/g, '')).toBe(italianTexts[id].replace(/\s/g, ''))
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenLastCalledWith(
      `[Alma widgets] Cannot format the default message "${id}". The message applies verbatim.`,
      expect.any(Error),
    )
  })

  it('returns the value as text when Intl rejects the options, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const intl = createIntl('fr')

    expect(intl.formatNumber(1.5, { style: 'currency' })).toBe('1.5')
    expect(intl.formatDate(Number.NaN)).toBe('NaN')
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('caches the IntlShape of a locale, so each message compiles once', () => {
    expect(createIntl('it-IT')).toBe(createIntl('it-IT'))
  })

  it('builds one Intl.NumberFormat per locale and option set', () => {
    const NumberFormat = vi.spyOn(Intl, 'NumberFormat')
    // Unique options: the formatter cache outlives each test.
    const currency = { style: 'currency', currency: 'CHF', minimumFractionDigits: 3 } as const
    const intl = createIntl('de-CH')

    intl.formatNumber(1, currency)
    intl.formatNumber(2, { ...currency })
    intl.formatNumber(3, { style: 'percent', minimumFractionDigits: 3 })
    createIntl('de-CH').formatNumber(4, currency)

    expect(NumberFormat).toHaveBeenCalledTimes(2)
  })

  it('takes a formatted message as the value of another, like the legal mentions', () => {
    const intl = createIntl('en')
    const link = (chunks: unknown[]) => ({ tag: 'link', chunks })
    const mail = (chunks: unknown[]) => ({ tag: 'mail', chunks })
    const disclaimer = intl.formatMessage<object>(legalMentionsMessages.disclaimer, { link, mail })

    const output = intl.formatMessage<object>(legalMentionsMessages.creditOrPnxWithoutFees, {
      financedAmount: '€100.00',
      customerLendingRate: '5%',
      creditDurationInMonths: 10,
      initialDeposit: '€10.00',
      purchaseAmount: '€110.00',
      disclaimer,
    })

    expect(output).toEqual([expect.stringMatching(/of €110\.00\. $/), disclaimer])
    expect(disclaimer).toEqual([
      'Subject to approval by Alma SAS (',
      { tag: 'link', chunks: ['almapay.com'] },
      expect.stringContaining('RCS Nanterre'),
      { tag: 'mail', chunks: ['support@almapay.com'] },
    ])
  })
})
