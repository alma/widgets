import cx from 'classnames'
import React, { FC } from 'react'
import { apiStatus, EligibilityPlan } from 'types'
import EligibilityPlansButtons from '../components/EligibilityPlansButtons'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Schedule from '../components/Schedule'
import Title from '../components/Title'
import s from './DesktopModal.module.css'

type Props = {
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  setCurrentPlanIndex: (index: number) => void
  currentPlan: EligibilityPlan
  status?: apiStatus
}

const DesktopModal: FC<Props> = ({
  eligibilityPlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  currentPlan,
  status = apiStatus.SUCCESS,
}) => (
  <div className={s.container} data-testid="modal-container">
    <div className={cx([s.block, s.left])}>
      <Title />
      <Info />
      <Logo />
    </div>
    <div className={s.block}>
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
    </div>
  </div>
)

export default DesktopModal
