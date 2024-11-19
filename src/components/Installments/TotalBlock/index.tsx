import React, { FunctionComponent } from 'react'
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl'
import { EligibilityPlan } from 'types'
import { priceFromCents } from 'utils'
import cx from 'classnames'
import s from './TotalBlock.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const TotalBlock: FunctionComponent<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  const intl = useIntl()
  const total = priceFromCents(currentPlan.purchase_amount + currentPlan.customer_total_cost_amount)
  const creditCost = priceFromCents(currentPlan.customer_total_cost_amount)
  const TAEG = (currentPlan?.annual_interest_rate && currentPlan.annual_interest_rate / 10000) || 0
  const customerFees = priceFromCents(currentPlan.customer_total_cost_amount)
  const isCredit = currentPlan.installments_count > 4
  const firstInstallmentAmount = priceFromCents(currentPlan.payment_plan?.[0]?.total_amount ?? 0)
  const totalWithoutFirstInstallment = priceFromCents(
    currentPlan.purchase_amount +
      currentPlan.customer_total_cost_amount -
      (currentPlan.payment_plan?.[0]?.total_amount ?? 0),
  )

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
        <div className={cx(s.total, STATIC_CUSTOMISATION_CLASSES.scheduleTotal)}>
          <FormattedMessage tagName="div" id="installments.total-amount" defaultMessage="Total" />
          <FormattedNumber value={total || 0} style="currency" currency="EUR" />
        </div>
        <div className={cx(s.fees, STATIC_CUSTOMISATION_CLASSES.scheduleCredit)}>
          {isCredit ? (
            <>
              <FormattedMessage
                id="credit-features.total-credit-cost"
                defaultMessage="Dont coût du crédit"
              />
              <span className={s.creditCost}>
                <FormattedMessage
                  id="credit-features.credit-cost-display"
                  defaultMessage="{creditCost} (TAEG {taegPercentage})"
                  values={{
                    creditCost: intl.formatNumber(creditCost, {
                      style: 'currency',
                      currency: 'EUR',
                    }),
                    taegPercentage: intl.formatNumber(TAEG, {
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
                tagName="div"
              />
              <div>
                <FormattedNumber value={customerFees} style="currency" currency="EUR" />
              </div>
            </>
          )}
        </div>
        {isCredit && (
          <div className={s.creditInfoLegalText}>
            <FormattedMessage
              id="credit-features.legal-text"
              defaultMessage="Crédit d'un montant de {totalWithoutFirstInstallment} au taux débiteur fixe de {taegPercentage} sur une durée de {installmeentsCountWithoutFirst} mois. Permettant, en complément d'un acompte de {firstInstallmentAmount}, de financer un achat d'un montant de {productPriceWithoutCreditCost}. Sous réserve d'étude et d'acceptation par Alma. Délai légal de rétractation de 14 jours. Simulation présentée par Alma, immatriculée au RCS Nanterre sous le numéro 839 100 575, établissement de paiement et société de financement agréée par l’ACPR sous le n° 17408 (numéro CIB / Code banque)."
              values={{
                totalWithoutFirstInstallment: intl.formatNumber(totalWithoutFirstInstallment, {
                  style: 'currency',
                  currency: 'EUR',
                }),
                taegPercentage: intl.formatNumber(TAEG, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                }),
                installmeentsCountWithoutFirst: currentPlan.installments_count - 1,
                firstInstallmentAmount: intl.formatNumber(firstInstallmentAmount, {
                  style: 'currency',
                  currency: 'EUR',
                }),
                productPriceWithoutCreditCost: intl.formatNumber(total - creditCost, {
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
