import React, { FC } from 'react'
import cx from 'classnames'
import { EligibilityPlan } from 'types'

import { paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import s from './EligibilityPlansButtons.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const EligibilityPlansButtons: FC<{
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
}> = ({ eligibilityPlans, currentPlanIndex, setCurrentPlanIndex }) => (
  <div className={cx(s.buttons, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}>
    {eligibilityPlans.map((eligibilityPlan, index) => (
      <button
        key={index}
        className={cx({
          [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: index === currentPlanIndex,
        })}
        onClick={() => setCurrentPlanIndex(index)}
      >
        {paymentPlanShorthandName(eligibilityPlan)}
      </button>
    ))}
  </div>
)

export default EligibilityPlansButtons
