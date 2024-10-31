import React, { FC } from 'react'

import cx from 'classnames'

import { EligibilityPlan } from '@/types'
import { paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/EligibilityPlansButtons/EligibilityPlansButtons.module.css'

const EligibilityPlansButtons: FC<{
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  // eslint-disable-next-line no-unused-vars
  setCurrentPlanIndex: (index: number) => void
}> = ({ eligibilityPlans, currentPlanIndex, setCurrentPlanIndex }) => (
  <div className={cx(s.buttons, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}>
    {eligibilityPlans.map((eligibilityPlan, key) => (
      <button
        type="button"
        key={`p${eligibilityPlan.installments_count}x-d+${eligibilityPlan.deferred_days}-m+${eligibilityPlan.deferred_months}`}
        className={cx({
          [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: key === currentPlanIndex,
        })}
        onClick={() => setCurrentPlanIndex(key)}
      >
        <span className={s.textButton}>{paymentPlanShorthandName(eligibilityPlan)}</span>
      </button>
    ))}
  </div>
)

export default EligibilityPlansButtons
