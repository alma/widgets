import React, { FC } from 'react'
import { EligibilityPlan } from 'types'

import EligibilityPlansButtons from '../components/EligibilityPlansButtons'
import Info from '../components/Info'
import Schedule from '../components/Schedule'
import Title from '../components/Title'
import Logo from '../components/Logo'

import s from './MobileModal.module.css'

type Props = {
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
  currentPlan: EligibilityPlan
}

const MobileModal: FC<Props> = ({
  eligibilityPlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  currentPlan,
}) => (
  <div className={s.container} data-testid="modal-container">
    <Title />
    <EligibilityPlansButtons
      eligibilityPlans={eligibilityPlans}
      currentPlanIndex={currentPlanIndex}
      setCurrentPlanIndex={setCurrentPlanIndex}
    />
    <Schedule currentPlan={currentPlan} />
    <Info />
    <Logo />
  </div>
)

export default MobileModal
