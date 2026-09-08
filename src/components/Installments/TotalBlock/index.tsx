import React, { FunctionComponent } from 'react'

import cx from 'classnames'
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl'

import { EligibilityPlanToDisplay } from '@/types'
import { priceFromCents } from '@/utils'
import {
  getAnnualPercentageRate,
  getTotalCreditCost,
  getTotalPurchaseAmount,
} from '@/utils/regulatoryFigures'
import s from 'components/Installments/TotalBlock/TotalBlock.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const TotalBlock: FunctionComponent<{ currentPlan: EligibilityPlanToDisplay }> = ({
  currentPlan,
}) => {
  const intl = useIntl()
  const total = priceFromCents(getTotalPurchaseAmount(currentPlan))
  const creditCost = priceFromCents(getTotalCreditCost(currentPlan))
  const annualPercentageRate = getAnnualPercentageRate(currentPlan)
  const isCredit = currentPlan.installments_count > 4

  return (
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
    </div>
  )
}

export default TotalBlock
