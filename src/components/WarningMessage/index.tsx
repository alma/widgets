import React, { FC } from 'react'

import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'

import { EligibilityPlanToDisplay } from '@/types'
import s from 'components/WarningMessage/WarningMessage.module.css'

/**
 * One entry per country of the DCC2 "Warning sentence" mapping. As for
 * `credit-features.legal-text`, `defaultMessage` holds the French source string only: every other
 * locale is filled in by Crowdin, so the Dutch/Italian/German/… wording is never hardcoded here.
 */
const messages = defineMessages({
  fr: {
    id: 'warning-message.fr',
    defaultMessage: "Attention ! Un crédit coûte de l'argent et doit être remboursé.",
  },
  lu: {
    id: 'warning-message.lu',
    defaultMessage: "Attention ! Emprunter de l'argent coûte de l'argent.",
  },
  be: {
    id: 'warning-message.be',
    defaultMessage: "Attention, emprunter de l'argent coûte aussi de l'argent.",
  },
  nl: {
    id: 'warning-message.nl',
    defaultMessage: "Attention, emprunter de l'argent coûte aussi de l'argent.",
  },
  it: {
    id: 'warning-message.it',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  de: {
    id: 'warning-message.de',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  pt: {
    id: 'warning-message.pt',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  es: {
    id: 'warning-message.es',
    defaultMessage: "Attention ! Emprunter de l'argent coûte de l'argent.",
  },
  gb: {
    id: 'warning-message.gb',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
})

/**
 * Keyed by `transaction_country` only
 */
const WARNINGS_BY_COUNTRY: Record<string, MessageDescriptor> = {
  FR: messages.fr,
  LU: messages.lu,
  // Belgium is a single id: the FR/NL split of the mapping is a locale concern, so Crowdin serves
  // the Dutch wording to nl visitors rather than us branching on the country twice.
  BE: messages.be,
  NL: messages.nl,
  IT: messages.it,
  DE: messages.de,
  PT: messages.pt,
  ES: messages.es,
  GB: messages.gb,
  // The mapping names this row "UK"; accept the non-ISO code in case the API sends it.
  UK: messages.gb,
}

type Props = { currentPlan: EligibilityPlanToDisplay }

const WarningMessage: FC<Props> = ({ currentPlan }) => {
  const intl = useIntl()
  const warning = WARNINGS_BY_COUNTRY[currentPlan.transaction_country?.toUpperCase()]

  // An unmapped country has no approved wording, and showing another country's legal warning would
  // be worse than showing none.
  if (!warning) return null

  return <p className={s.warning}>{intl.formatMessage(warning)}</p>
}

export default WarningMessage
