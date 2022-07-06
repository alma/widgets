import messagesDE from 'intl/messages/messages.de.json'
import messagesEN from 'intl/messages/messages.en.json'
import messagesES from 'intl/messages/messages.es.json'
import messagesFR from 'intl/messages/messages.fr.json'
import messagesIT from 'intl/messages/messages.it.json'
import messagesNL from 'intl/messages/messages.nl.json'
import messagesPT from 'intl/messages/messages.pt.json'
import { Locale } from 'types'

export const getTranslationsByLocale = (locale: Locale): Record<string, string> => {
  switch (locale) {
    case Locale.fr:
      return messagesFR
    case Locale.es:
      return messagesES
    case Locale.it:
      return messagesIT
    case Locale.de:
      return messagesDE
    case Locale.pt:
      return messagesPT
    case Locale.nl:
    case Locale['nl-BE']:
    case Locale['nl-NL']:
      return messagesNL
    case Locale.en:
    default:
      return messagesEN
  }
}
