import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import { EligibilityPlan } from '@/types'
import Installment from 'components/Installments/Installment'
import TotalBlock from 'components/Installments/TotalBlock'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/Schedule/Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlan; id?: string }> = ({ currentPlan, id }) => (
  <div
    id={id}
    className={s.scheduleContainer}
    role="region"
    aria-labelledby="payment-schedule-title"
    aria-describedby="payment-schedule-description"
    tabIndex={-1}
  >
    <h2 id="payment-schedule-title" className="sr-only">
      <FormattedMessage
        id="accessibility.payment-schedule-title"
        defaultMessage="Calendrier de paiement"
      />
    </h2>
    <div id="payment-schedule-description">
      <ul
        className={cx(s.schedule, STATIC_CUSTOMISATION_CLASSES.scheduleDetails)}
        data-testid="modal-installments-element"
      >
        {(currentPlan?.payment_plan || []).map((installment, index) => (
          <li key={installment.due_date * 1000} className={s.scheduleItem}>
            <Installment installment={installment} index={index} />
          </li>
        ))}
      </ul>
      <TotalBlock currentPlan={currentPlan} />
    </div>
  </div>
)

export default Schedule
