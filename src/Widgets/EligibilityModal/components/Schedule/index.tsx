import React, { FC } from 'react'
import cx from 'classnames'
import { FormattedDate, FormattedMessage, FormattedNumber, useIntl } from 'react-intl'
import { EligibilityPlan } from 'types'
import { priceFromCents } from 'utils'
import { isToday } from 'date-fns'

import s from './Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  const total =
    currentPlan &&
    priceFromCents(currentPlan.purchase_amount + currentPlan.customer_total_cost_amount)
  const creditCost = currentPlan ? priceFromCents(currentPlan.customer_total_cost_amount) : 0
  const TAEG = currentPlan?.annual_interest_rate && currentPlan.annual_interest_rate / 10000
  const customerFees = priceFromCents(currentPlan ? currentPlan.customer_total_cost_amount : 0)
  const isCredit = currentPlan && currentPlan.installments_count > 4
  const intl = useIntl()

  return (
    <div className={s.schedule} data-testid="modal-installments-element">
      <div className={cx(s.scheduleLine, s.total)}>
        <span>
          <FormattedMessage id="eligibility-modal.total" defaultMessage="Total" />
        </span>
        <span>
          <FormattedNumber value={total} style="currency" currency="EUR" />
        </span>
      </div>
      <div className={cx(s.scheduleLine, s.creditCost)}>
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
        <span>
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
  )
}

export default Schedule
