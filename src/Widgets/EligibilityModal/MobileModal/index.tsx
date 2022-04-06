import React, { FC } from 'react'
import { apiStatus, EligibilityPlan } from 'types'
import EligibilityPlansButtons from '../components/EligibilityPlansButtons'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Schedule from '../components/Schedule'
import Title from '../components/Title'
import s from './MobileModal.module.css'

type Props = {
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
  currentPlan: EligibilityPlan
  status?: apiStatus
}

const MobileModal: FC<Props> = ({
  eligibilityPlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  currentPlan,
  status = apiStatus.SUCCESS,
}) => (
  <div className={s.container} data-testid="modal-container">
    <Title />
    {status === apiStatus.SUCCESS && (
      <>
        <EligibilityPlansButtons
          eligibilityPlans={eligibilityPlans}
          currentPlanIndex={currentPlanIndex}
          setCurrentPlanIndex={setCurrentPlanIndex}
        />
        <Schedule currentPlan={currentPlan} />
      </>
    )}
    <Info />
    <Logo />
  </div>
)

export default MobileModal
