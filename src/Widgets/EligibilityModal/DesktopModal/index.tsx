import React, { FC } from 'react'
import cx from 'classnames'
import { EligibilityPlan } from 'types'

import EligibilityPlansButtons from '../components/EligibilityPlansButtons'
import Info from '../components/Info'
import Schedule from '../components/Schedule'
import Title from '../components/Title'
import Logo from '../components/Logo'

import s from './DesktopModal.module.css'

type Props = {
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
  currentPlan: EligibilityPlan
}

const DesktopModal: FC<Props> = ({
  eligibilityPlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  currentPlan,
}) => (
  <div className={s.container} data-testid="modal-container">
    <div className={cx([s.block, s.left])}>
      <Title />
      <Info />
      <Logo />
    </div>
    <div className={s.block}>
      <EligibilityPlansButtons
        eligibilityPlans={eligibilityPlans}
        currentPlanIndex={currentPlanIndex}
        setCurrentPlanIndex={setCurrentPlanIndex}
      />
      <Schedule currentPlan={currentPlan} />
    </div>
  </div>
)

export default DesktopModal
