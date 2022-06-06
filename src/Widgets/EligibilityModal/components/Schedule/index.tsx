import React, { FC } from 'react'
import cx from 'classnames'
import { FormattedDate, FormattedMessage, FormattedNumber, useIntl } from 'react-intl'
import { EligibilityPlan } from 'types'
import { priceFromCents } from 'utils'
import { isToday } from 'date-fns'

import s from './Schedule.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const Schedule: FC<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  const total = priceFromCents(currentPlan.purchase_amount + currentPlan.customer_total_cost_amount)
  const creditCost = priceFromCents(currentPlan.customer_total_cost_amount)
  const TAEG = currentPlan?.annual_interest_rate && currentPlan.annual_interest_rate / 10000
  const customerFees = priceFromCents(currentPlan.customer_total_cost_amount)
  const isCredit = currentPlan.installments_count > 4
  const intl = useIntl()

  return (
    <>
      <div
        className={cx(s.schedule, STATIC_CUSTOMISATION_CLASSES.scheduleDetails)}
        data-testid="modal-installments-element"
      >
        {(currentPlan?.payment_plan || []).map((installment, index) => (
          <div className={s.scheduleLine} key={index}>
            <span>
              {isToday(installment.due_date * 1000) ? (
                <FormattedMessage id="installments.today" defaultMessage="Aujourd'hui" />
              ) : (
                <FormattedDate
                  value={installment.due_date * 1000}
                  day="numeric"
                  month="long"
                  year="numeric"
                />
              )}
            </span>
            <span>
              <FormattedNumber
                value={priceFromCents(installment.total_amount)}
                style="currency"
                currency="EUR"
              />
            </span>
          </div>
        ))}
      </div>
      <div
        className={cx(s.summary, STATIC_CUSTOMISATION_CLASSES.summary)}
        data-testid="modal-summary"
      >
        <div className={cx(s.scheduleLine, s.total, STATIC_CUSTOMISATION_CLASSES.scheduleTotal)}>
          <span>
            <FormattedMessage id="eligibility-modal.total" defaultMessage="Total" />
          </span>
          <span>
            <FormattedNumber value={total} style="currency" currency="EUR" />
          </span>
        </div>
        <div
          className={cx(s.scheduleLine, s.creditCost, STATIC_CUSTOMISATION_CLASSES.scheduleCredit)}
        >
          {isCredit ? (
            <span>
              <FormattedMessage
                id="eligibility-modal.credit-cost"
                defaultMessage="Dont coût du crédit"
              />
            </span>
          ) : (
            <span>
              <FormattedMessage id="eligibility-modal.cost" defaultMessage="Dont frais" />
            </span>
          )}
          <span className={s.creditCostAmount}>
            {isCredit ? (
              <FormattedMessage
                id="eligibility-modal.credit-cost-amount"
                defaultMessage="{creditCost} (TAEG {TAEG})"
                values={{
                  creditCost: intl.formatNumber(creditCost, {
                    style: 'currency',
                    currency: 'EUR',
                  }),
                  TAEG: intl.formatNumber(TAEG ?? 0, {
                    style: 'percent',
                    maximumFractionDigits: 2,
                  }),
                }}
              />
            ) : (
              <FormattedNumber value={customerFees} style="currency" currency="EUR" />
            )}
          </span>
        </div>
        {isCredit && (
          <p className={s.creditMessage}>
            <FormattedMessage
              id="eligibility-modal.credit-commitment"
              defaultMessage="Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement
              avant de vous engager."
            />
          </p>
        )}
      </div>
    </>
  )
}

export default Schedule
