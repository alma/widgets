import messagesDE from 'intl/messages/messages.de.json'
import messagesEN from 'intl/messages/messages.en.json'
import messagesES from 'intl/messages/messages.es.json'
import messagesFR from 'intl/messages/messages.fr.json'
import messagesIT from 'intl/messages/messages.it.json'
import messagesNLBE from 'intl/messages/messages.nl-BE.json'
import messagesNLNL from 'intl/messages/messages.nl-NL.json'
import { Locale } from 'types'

export const getTranslationsByLocale = (locale: Locale): Record<string, string> => {
  switch (locale) {
    case Locale.fr:
      return messagesFR
    case Locale.en:
      return messagesEN
    case Locale.es:
      return messagesES
    case Locale.it:
      return messagesIT
    case Locale.de:
      return messagesDE
    case Locale['nl-BE']:
      return messagesNLBE
    case Locale['nl-NL']:
      return messagesNLNL
    default:
      return messagesEN
  }
}
