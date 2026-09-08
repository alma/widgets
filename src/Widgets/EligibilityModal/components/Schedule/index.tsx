import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import { EligibilityPlanToDisplay } from '@/types'
import { requiresLegalDisclosure } from '@/utils/regulatoryFigures'
import Installment from 'components/Installments/Installment'
import LegalMentions from 'components/Installments/LegalMentions'
import TotalBlock from 'components/Installments/TotalBlock'
import WarningMessage from 'components/WarningMessage'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/Schedule/Schedule.module.css'

const Schedule: FC<{ currentPlan: EligibilityPlanToDisplay; id?: string }> = ({
  currentPlan,
  id,
}) => (
  <div
    id={id}
    className={s.scheduleContainer}
    role="region"
    aria-labelledby="payment-schedule-title"
    aria-describedby="payment-schedule-description"
    tabIndex={-1}
  >
    <div id="payment-schedule-title" className="sr-only" role="heading" aria-level={2}>
      <FormattedMessage
        id="accessibility.payment-schedule-title"
        defaultMessage="Calendrier de paiement"
      />
    </div>
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
      {requiresLegalDisclosure(currentPlan) && (
        <div className={s.warningContainer}>
          <WarningMessage currentPlan={currentPlan} />
        </div>
      )}
      <TotalBlock currentPlan={currentPlan} />
      {requiresLegalDisclosure(currentPlan) && (
        <div className={s.legalMentionsContainer}>
          <LegalMentions currentPlan={currentPlan} />
        </div>
      )}
    </div>
  </div>
)


export default Schedule
