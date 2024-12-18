import React, { FC } from 'react'
import cx from 'classnames'
import { FormattedMessage } from 'react-intl'
import { EligibilityPlan } from '@/types'
import Installment from 'components/Installments/Installment'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/Schedule/Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  return (
      <div
        className={cx(s.schedule, STATIC_CUSTOMISATION_CLASSES.scheduleDetails)}
        data-testid="modal-installments-element"
      >
        {(currentPlan?.payment_plan || []).map((installment, index) => (
          <Installment key={installment.due_date * 1000} installment={installment} index={index} />
        ))}
      </div>
  )
}

export default Schedule
