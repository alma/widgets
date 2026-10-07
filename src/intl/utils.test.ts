import messagesDE from '@/intl/messages/messages.de.json'
import messagesEN from '@/intl/messages/messages.en.json'
import messagesES from '@/intl/messages/messages.es.json'
import messagesFR from '@/intl/messages/messages.fr.json'
import messagesIT from '@/intl/messages/messages.it.json'
import messagesNL from '@/intl/messages/messages.nl.json'
import messagesPT from '@/intl/messages/messages.pt.json'
import { getTranslationsByLocale } from '@/intl/utils'
import { Locale } from '@/shared/i18n/i18n.const'

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
    expect(getTranslationsByLocale('fr-CA' as Locale)).toBe(messagesFR)
  })

  it('should fall back to English for a language it has no catalogue for', () => {
    expect(getTranslationsByLocale('ja' as Locale)).toBe(messagesEN)
  })
})
