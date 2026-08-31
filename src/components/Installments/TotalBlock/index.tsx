import React, { FunctionComponent } from 'react'

import cx from 'classnames'
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl'

import { EligibilityPlan } from '@/types'
import { priceFromCents } from '@/utils'
import {
  getAnnualPercentageRate,
  getCreditDurationInMonths,
  getFinancedAmount,
  getInitialDeposit,
  getTotalCreditCost,
  getTotalPurchaseAmount,
} from '@/utils/regulatoryFigures'
import s from 'components/Installments/TotalBlock/TotalBlock.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const TotalBlock: FunctionComponent<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  const intl = useIntl()
  const total = priceFromCents(getTotalPurchaseAmount(currentPlan))
  const creditCost = priceFromCents(getTotalCreditCost(currentPlan))
  const annualPercentageRate = getAnnualPercentageRate(currentPlan)
  const isCredit = currentPlan.installments_count > 4
  const initialDeposit = priceFromCents(getInitialDeposit(currentPlan))
  const financedAmount = priceFromCents(getFinancedAmount(currentPlan))
  const creditDurationInMonths = getCreditDurationInMonths(currentPlan)
  const purchaseAmount = total - creditCost

  return (
    <>
      {isCredit && (
        <div className={s.creditInfo}>
          <span className={s.creditInfoTitle}>
            <FormattedMessage
              id="credit-features.information.title"
              defaultMessage="Un crédit vous engage et doit être remboursé."
            />
          </span>
          <br />
          <FormattedMessage
            id="credit-features.information"
            defaultMessage="Vérifiez vos capacités de remboursement avant de vous engager."
          />
        </div>
      )}
      <div
        className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.summary)}
        data-testid="modal-summary"
      >
        <p className={cx(s.total, STATIC_CUSTOMISATION_CLASSES.scheduleTotal)}>
          <FormattedMessage tagName="span" id="installments.total-amount" defaultMessage="Total" />
          <FormattedNumber value={total || 0} style="currency" currency="EUR" />
        </p>
        <p className={cx(s.fees, STATIC_CUSTOMISATION_CLASSES.scheduleCredit)}>
          {isCredit ? (
            <>
              <FormattedMessage
                id="credit-features.total-credit-cost"
                defaultMessage="Dont coût du crédit"
              />
              <span className={s.creditCost}>
                <FormattedMessage
                  id="credit-features.credit-cost-display"
                  defaultMessage="{creditCost} (TAEG {annualPercentageRate})"
                  values={{
                    creditCost: intl.formatNumber(creditCost, {
                      style: 'currency',
                      currency: 'EUR',
                    }),
                    annualPercentageRate: intl.formatNumber(annualPercentageRate, {
                      style: 'percent',
                      maximumFractionDigits: 2,
                    }),
                  }}
                />
              </span>
            </>
          ) : (
            <>
              <FormattedMessage
                id="installments.total-fees"
                defaultMessage="Dont frais (TTC)"
                tagName="span"
              />
              <span>
                <FormattedNumber value={creditCost} style="currency" currency="EUR" />
              </span>
            </>
          )}
        </p>
        {isCredit && (
          <div className={s.creditInfoLegalText}>
            <FormattedMessage
              id="credit-features.legal-text"
              defaultMessage="Crédit d'un montant de {financedAmount} au taux débiteur fixe de {annualPercentageRate} sur une durée de {creditDurationInMonths} mois. Permettant, en complément d'un acompte de {initialDeposit}, de financer un achat d'un montant de {purchaseAmount}. Sous réserve d'étude et d'acceptation par Alma. Délai légal de rétractation de 14 jours. Simulation présentée par Alma, immatriculée au RCS Nanterre sous le numéro 839 100 575, établissement de paiement et société de financement agréée par l’ACPR sous le n° 17408 (numéro CIB / Code banque)."
              values={{
                financedAmount: intl.formatNumber(financedAmount, {
                  style: 'currency',
                  currency: 'EUR',
                }),
                annualPercentageRate: intl.formatNumber(annualPercentageRate, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                }),
                creditDurationInMonths,
                initialDeposit: intl.formatNumber(initialDeposit, {
                  style: 'currency',
                  currency: 'EUR',
                }),
                purchaseAmount: intl.formatNumber(purchaseAmount, {
                  style: 'currency',
                  currency: 'EUR',
                }),
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default TotalBlock
