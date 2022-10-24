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

  return (
    <div
      className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.summary)}
      data-testid="modal-summary"
    >
      <h3 className={cx(s.total, STATIC_CUSTOMISATION_CLASSES.scheduleTotal)}>
        <FormattedMessage tagName="div" id="installments.total-amount" defaultMessage="Total" />
        <FormattedNumber value={total || 0} style="currency" currency="EUR" />
      </h3>
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
    </div>
  )
}

export default TotalBlock
