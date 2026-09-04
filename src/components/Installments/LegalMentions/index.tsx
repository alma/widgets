import React, { ReactNode } from 'react'

import { secondsToMilliseconds } from 'date-fns'
import { FormatNumberOptions, FormattedMessage, useIntl } from 'react-intl'

import { EligibilityPlanToDisplay } from '@/types'
import { priceFromCents } from '@/utils'
import {
  getAnnualPercentageRate,
  getCreditDurationInMonths,
  getCustomerFees,
  getFinancedAmount,
  getInitialDeposit,
  getTotalPurchaseAmount,
  isCredit,
  isPayLater,
} from '@/utils/regulatoryFigures'
import s from 'components/Installments/LegalMentions/LegalMentions.module.css'

export interface LegalMentionsProps {
  currentPlan: EligibilityPlanToDisplay
}

const LegalMentions = ({ currentPlan }: LegalMentionsProps) => {
  const { formatNumber, formatDate, formatMessage } = useIntl()

  const disclaimer = formatMessage(
    {
      id: 'legal-mentions.disclaimer',
      defaultMessage:
        "Sous réserve d'acceptation par Alma SAS (<link>almapay.com</link>), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: <mail>support@almapay.com</mail>",
    },
    {
      link: (chunks: ReactNode) => (
        <a
          href="https://almapay.com"
          target="_blank"
          rel="noopener noreferrer"
          className={s.disclaimerLink}
        >
          {chunks}
        </a>
      ),
      mail: (chunks: ReactNode) => (
        <a href="mailto:support@almapay.com" className={s.disclaimerLink}>
          {chunks}
        </a>
      ),
    },
  )

  const formatPrice = (cents: number, options?: FormatNumberOptions) =>
    formatNumber(priceFromCents(cents), { ...(options || {}), style: 'currency', currency: 'EUR' })

  const purchaseAmount = formatPrice(currentPlan.purchase_amount)
  const financedAmount = formatPrice(getFinancedAmount(currentPlan))
  const creditDurationInMonths = getCreditDurationInMonths(currentPlan)
  const initialDeposit = formatPrice(getInitialDeposit(currentPlan))
  const annualPercentageRate = formatNumber(getAnnualPercentageRate(currentPlan), {
    style: 'percent',
    maximumFractionDigits: 2,
  })

  if (isCredit(currentPlan)) {
    return (
      <div className={s.legalMentions} data-testid="legal-mentions">
        <FormattedMessage
          id="legal-mentions.credit-or-pnx-without-fees"
          defaultMessage="Crédit de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, de financer un achat de {purchaseAmount}. {disclaimer}"
          values={{
            financedAmount,
            annualPercentageRate,
            creditDurationInMonths,
            initialDeposit,
            purchaseAmount,
            disclaimer,
          }}
        />
      </div>
    )
  }

  const fees = getCustomerFees(currentPlan)
  const hasFees = fees > 0

  if (isPayLater(currentPlan)) {
    const { deferred_days: deferredDays, deferred_months: deferredMonths } = currentPlan
    const deferredDuration =
      deferredMonths > 0
        ? formatMessage(
          {
            id: 'payment-plan-strings.deferred.months',
            defaultMessage: '{months, number} {months, plural, one {mois} other {mois}}',
          },
          { months: deferredMonths },
        )
        : formatMessage(
          {
            id: 'payment-plan-strings.deferred.days',
            defaultMessage: '{days, number} {days, plural, one {jour} other {jours}}',
          },
          { days: deferredDays },
        )

    const totalDue = formatPrice(getTotalPurchaseAmount(currentPlan), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const dueDate = formatDate(
      secondsToMilliseconds(currentPlan.payment_plan?.[0]?.due_date ?? 0),
      { day: 'numeric', month: 'long', year: 'numeric' },
    )

    return (
      <div className={s.legalMentions} data-testid="legal-mentions">
        {hasFees ? (
          <FormattedMessage
            id="legal-mentions.pay-later-with-fees"
            defaultMessage="Crédit de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur {deferredDuration}. Permettant de financer un achat de {purchaseAmount}, incluant des frais de {fees}. Montant total dû : {totalDue}, prélevés le {dueDate}. {disclaimer}"
            values={{
              financedAmount,
              annualPercentageRate,
              deferredDuration,
              purchaseAmount,
              fees: formatPrice(fees),
              totalDue,
              dueDate,
              disclaimer,
            }}
          />
        ) : (
          <FormattedMessage
            id="legal-mentions.pay-later-without-fees"
            defaultMessage="Crédit de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur {deferredDuration}. Permettant de financer un achat de {purchaseAmount}. Montant total dû : {totalDue}, prélevés le {dueDate}. {disclaimer}"
            values={{
              financedAmount,
              annualPercentageRate,
              deferredDuration,
              purchaseAmount,
              totalDue,
              dueDate,
              disclaimer,
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={s.legalMentions} data-testid="legal-mentions">
      {hasFees ? (
        <FormattedMessage
          id="legal-mentions.pnx-with-fees"
          defaultMessage="Crédit de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, incluant des frais de {fees}, de financer un achat de {purchaseAmount}. {disclaimer}"
          values={{
            financedAmount,
            annualPercentageRate,
            creditDurationInMonths,
            initialDeposit,
            fees: formatPrice(fees),
            purchaseAmount,
            disclaimer,
          }}
        />
      ) : (
        <FormattedMessage
          id="legal-mentions.credit-or-pnx-without-fees"
          defaultMessage="Crédit de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, de financer un achat de {purchaseAmount}. {disclaimer}"
          values={{
            financedAmount,
            annualPercentageRate,
            creditDurationInMonths,
            initialDeposit,
            purchaseAmount,
            disclaimer,
          }}
        />
      )}
    </div>
  )
}

export default LegalMentions
