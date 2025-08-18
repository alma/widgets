import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import { EligibilityPlan } from '@/types'
import Installment from 'components/Installments/Installment'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/Schedule/Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlan; id?: string }> = ({ currentPlan, id }) => (
  <div>
    <h2 id="payment-schedule-title" className="sr-only">
      <FormattedMessage
        id="accessibility.payment-schedule-title"
        defaultMessage="Calendrier de paiement"
      />
    </h2>
    <div
      id={id}
      className={cx(s.schedule, STATIC_CUSTOMISATION_CLASSES.scheduleDetails)}
      data-testid="modal-installments-element"
      role="region"
      aria-labelledby="payment-schedule-title"
      tabIndex={-1}
    >
      {(currentPlan?.payment_plan || []).map((installment, index) => (
        <Installment key={installment.due_date * 1000} installment={installment} index={index} />
      ))}
    </div>
  </div>
)

export default Schedule
