import React, { FC } from 'react'
import cx from 'classnames'
import { EligibilityPlan } from 'types'

import { paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import s from './EligibilityPlansButtons.module.css'

const EligibilityPlansButtons: FC<{
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
}> = ({ eligibilityPlans, currentPlanIndex, setCurrentPlanIndex }) => (
  <div className={s.buttons}>
    {eligibilityPlans.map((eligibilityPlan, index) => (
      <button
        key={index}
        className={cx({ [s.active]: index === currentPlanIndex })}
        onClick={() => setCurrentPlanIndex(index)}
      >
        {paymentPlanShorthandName(eligibilityPlan)}
      </button>
    ))}
  </div>
)

export default EligibilityPlansButtons
