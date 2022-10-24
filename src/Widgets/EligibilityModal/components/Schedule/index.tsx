import cx from 'classnames'
import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { EligibilityPlan } from 'types'

import Installment from 'components/Installments/Installment'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from './Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlan }> = ({ currentPlan }) => {
  const isCredit = currentPlan.installments_count > 4

  return (
    <>
      <div
        className={cx(s.schedule, STATIC_CUSTOMISATION_CLASSES.scheduleDetails)}
        data-testid="modal-installments-element"
      >
        {(currentPlan?.payment_plan || []).map((installment, index) => (
          <Installment key={installment.due_date * 1000} installment={installment} index={index} />
        ))}
        {isCredit && (
          <div className={s.creditInfo}>
            <FormattedMessage
              id="credit-features.information"
              defaultMessage="Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager."
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Schedule
