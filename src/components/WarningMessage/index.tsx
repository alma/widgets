import React, { FC } from 'react'

import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'

import { EligibilityPlanToDisplay } from '@/types'
import { hasFeeSharing } from '@/utils/regulatoryFigures'
import s from 'components/WarningMessage/WarningMessage.module.css'

/**
 * One entry per sentence of the DCC2 "Warning sentence" mapping. As for
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
  nlWithoutFees: {
    id: 'warning-message.nl.without-fees',
    defaultMessage:
      'Attention : un prêt est contraignant et doit être remboursé. Vérifiez le coût du prêt et votre capacité de remboursement avant de conclure un contrat.',
  },
  nlWithFees: {
    id: 'warning-message.nl.with-fees',
    defaultMessage: "Attention, emprunter de l'argent coûte aussi de l'argent.",
  },
  itWithoutFees: {
    id: 'warning-message.it.without-fees',
    defaultMessage:
      'Important : un prêt est contraignant et doit être remboursé. Vérifiez le coût du prêt avant de vous engager.',
  },
  itWithFees: {
    id: 'warning-message.it.with-fees',
    defaultMessage: "Attention : emprunter de l'argent entraîne des coûts.",
  },
  deWithoutFees: {
    id: 'warning-message.de.without-fees',
    defaultMessage:
      'Un crédit est contraignant et doit être remboursé. Vérifiez le coût du crédit avant de vous engager.',
  },
  deWithFees: {
    id: 'warning-message.de.with-fees',
    defaultMessage: "Attention ! Souscrire un crédit coûte de l'argent.",
  },
  ptWithoutFees: {
    id: 'warning-message.pt.without-fees',
    defaultMessage:
      'Attention ! Un crédit est un engagement et doit être remboursé. Vérifiez le coût du crédit et votre capacité de remboursement avant de vous engager.',
  },
  ptWithFees: {
    id: 'warning-message.pt.with-fees',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  es: {
    id: 'warning-message.es',
    defaultMessage:
      'Attention, un crédit est contraignant et doit être remboursé. Vérifiez le coût du prêt et votre capacité de remboursement avant de vous engager.',
  },
  gb: {
    id: 'warning-message.gb',
    defaultMessage: "Attention ! Emprunter de l'argent coûte de l'argent.",
  },
})

type WarningVariants = {
  withFees: MessageDescriptor
  withoutFees: MessageDescriptor
}

/**
 * Keyed by `transaction_country`, never by plan family or deferred status: a deferred P1X plan gets
 * the same sentence as any other plan booked in the same country with the same fee sharing.
 * Countries whose mapping reads "Same" in both columns point at a single message id.
 */
const WARNINGS_BY_COUNTRY: Record<string, WarningVariants> = {
  FR: { withoutFees: messages.fr, withFees: messages.fr },
  LU: { withoutFees: messages.lu, withFees: messages.lu },
  // Belgium is a single id: the FR/NL split of the mapping is a locale concern, so Crowdin serves
  // the Dutch wording to nl visitors rather than us branching on the country twice.
  BE: { withoutFees: messages.be, withFees: messages.be },
  NL: { withoutFees: messages.nlWithoutFees, withFees: messages.nlWithFees },
  IT: { withoutFees: messages.itWithoutFees, withFees: messages.itWithFees },
  DE: { withoutFees: messages.deWithoutFees, withFees: messages.deWithFees },
  PT: { withoutFees: messages.ptWithoutFees, withFees: messages.ptWithFees },
  ES: { withoutFees: messages.es, withFees: messages.es },
  GB: { withoutFees: messages.gb, withFees: messages.gb },
  // The mapping names this row "UK"; accept the non-ISO code in case the API sends it.
  UK: { withoutFees: messages.gb, withFees: messages.gb },
}

type Props = { currentPlan: EligibilityPlanToDisplay }

const WarningMessage: FC<Props> = ({ currentPlan }) => {
  const intl = useIntl()
  const variants = WARNINGS_BY_COUNTRY[currentPlan.transaction_country?.toUpperCase()]

  // An unmapped country has no approved wording, and showing another country's legal warning would
  // be worse than showing none.
  if (!variants) return null

  return (
    <p className={s.warning} data-testid="warning-message">
      {intl.formatMessage(hasFeeSharing(currentPlan) ? variants.withFees : variants.withoutFees)}
    </p>
  )
}

export default WarningMessage
