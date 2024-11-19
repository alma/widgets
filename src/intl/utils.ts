import { Locale } from '@/types'
import messagesDE from 'intl/messages/messages.de.json'
import messagesEN from 'intl/messages/messages.en.json'
import messagesES from 'intl/messages/messages.es.json'
import messagesFR from 'intl/messages/messages.fr.json'
import messagesIT from 'intl/messages/messages.it.json'
import messagesNL from 'intl/messages/messages.nl.json'
import messagesPT from 'intl/messages/messages.pt.json'

export const getTranslationsByLocale = (locale: Locale): Record<string, string> => {
  // A CMS plugin can add LCID format like : 'fr-FR' instead of 'fr'.
  // Instead of specifying all possibilities we just remove the last part of the string.
  const merchantLocale = locale.slice(0, 2)
  switch (merchantLocale) {
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
      return messagesNL
    case Locale.en:
    default:
      return messagesEN
  }
}
