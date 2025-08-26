import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import { EligibilityPlan } from '@/types'
import { paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/EligibilityPlansButtons/EligibilityPlansButtons.module.css'

const EligibilityPlansButtons: FC<{
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  // eslint-disable-next-line no-unused-vars
  setCurrentPlanIndex: (index: number) => void
  id?: string
}> = ({ eligibilityPlans, currentPlanIndex, setCurrentPlanIndex, id }) => (
  <div>
    <h2 id="payment-plans-title" className="sr-only">
      <FormattedMessage
        id="accessibility.payment-plans-title"
        defaultMessage="Options de paiement disponibles"
      />
    </h2>
    <div
      id={id}
      className={cx(s.buttons, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}
      role="group"
      aria-labelledby="payment-plans-title"
    >
      {eligibilityPlans.map((eligibilityPlan, key) => (
        <button
          type="button"
          key={`p${eligibilityPlan.installments_count}x-d+${eligibilityPlan.deferred_days}-m+${eligibilityPlan.deferred_months}`}
          className={cx({
            [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: key === currentPlanIndex,
          })}
          onClick={() => setCurrentPlanIndex(key)}
          aria-pressed={key === currentPlanIndex}
          aria-describedby="payment-info"
          aria-current={key === currentPlanIndex ? 'true' : undefined}
        >
          <span className={s.textButton}>{paymentPlanShorthandName(eligibilityPlan)}</span>
        </button>
      ))}
    </div>
  </div>
)

export default EligibilityPlansButtons
