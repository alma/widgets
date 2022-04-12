import LoadingIndicator from 'components/LoadingIndicator'
import Modal from 'components/Modal'
import React, { FunctionComponent, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useMediaQuery } from 'react-responsive'
import { apiStatus, EligibilityPlan } from 'types'
import EligibilityPlansButtons from './components/EligibilityPlansButtons'
import Schedule from './components/Schedule'
import DesktopModal from './DesktopModal'
import s from './EligibilityModal.module.css'
import MobileModal from './MobileModal'

type Props = {
  initialPlanIndex?: number
  onClose: () => void
  eligibilityPlans: EligibilityPlan[]
  status: apiStatus
}

const EligibilityModal: FunctionComponent<Props> = ({
  initialPlanIndex,
  onClose,
  eligibilityPlans,
  status,
}) => {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(initialPlanIndex || 0)
  const isBigScreen = useMediaQuery({ minWidth: 800 })
  const ModalComponent = isBigScreen ? DesktopModal : MobileModal
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)
  const currentPlan = eligiblePlans[currentPlanIndex]
  const modalProps = {
    eligibilityPlans: eligiblePlans,
    currentPlanIndex,
    setCurrentPlanIndex,
    currentPlan,
    status,
  }

  return (
    <Modal onClose={onClose} ariaHideApp={false} scrollable isOpen>
      <ModalComponent {...modalProps}>
        {status === apiStatus.PENDING && (
          <div className={s.loader}>
            <LoadingIndicator />
          </div>
        )}
        {status === apiStatus.SUCCESS && eligiblePlans.length === 0 && (
          <div className={s.noEligibility}>
            <FormattedMessage
              id="eligibility-modal.no-eligibility"
              defaultMessage="Oups, il semblerait que la simulation n'aie pas fonctionné."
            />
          </div>
        )}
        {status === apiStatus.SUCCESS && eligiblePlans.length >= 1 && (
          <>
            <EligibilityPlansButtons
              eligibilityPlans={eligiblePlans}
              currentPlanIndex={currentPlanIndex}
              setCurrentPlanIndex={setCurrentPlanIndex}
            />
            <Schedule currentPlan={currentPlan} />
          </>
        )}
      </ModalComponent>
    </Modal>
  )
}
export default EligibilityModal
