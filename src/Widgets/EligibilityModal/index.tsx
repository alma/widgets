import TotalBlock from 'components/Installments/TotalBlock'
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator'
import Modal from 'components/Modal'
import React, { FunctionComponent, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useMediaQuery } from 'react-responsive'
import { apiStatus, Card, EligibilityPlan } from 'types'
import { desktopWidth, isP1X } from 'utils'
import EligibilityPlansButtons from './components/EligibilityPlansButtons'
import Schedule from './components/Schedule'
import DesktopModal from './DesktopModal'
import s from './EligibilityModal.module.css'
import MobileModal from './MobileModal'
import { QueryStatus } from 'react-query'

type Props = {
  initialPlanIndex?: number
  onClose: (event: React.MouseEvent | React.KeyboardEvent) => void
  eligibilityPlans: EligibilityPlan[]
  status: QueryStatus
  cards?: Card[]
}

const EligibilityModal: FunctionComponent<Props> = ({
  initialPlanIndex,
  onClose,
  eligibilityPlans,
  status,
  cards,
}) => {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(initialPlanIndex || 0)
  const isBigScreen = useMediaQuery({ minWidth: desktopWidth })
  const ModalComponent = isBigScreen ? DesktopModal : MobileModal
  const currentPlan = eligibilityPlans[currentPlanIndex]

  const isSomePlanDeferred = eligibilityPlans.some(
    (plan) => plan.deferred_days > 0 || plan.deferred_months > 0,
  )

  return (
    <Modal onClose={onClose} ariaHideApp={false} scrollable isOpen>
      <ModalComponent
        isSomePlanDeferred={isSomePlanDeferred}
        cards={cards}
        isCurrentPlanP1X={isP1X(currentPlan)}
      >
        {status === apiStatus.SUCCESS && (
          <div className={s.loader}>
            <LoadingIndicator />
          </div>
        )}
        {status === apiStatus.SUCCESS && eligibilityPlans.length === 0 && (
          <div className={s.noEligibility}>
            <FormattedMessage
              id="eligibility-modal.no-eligibility"
              defaultMessage="Oups, il semblerait que la simulation n'ait pas fonctionné."
            />
          </div>
        )}
        {status === apiStatus.SUCCESS && eligibilityPlans.length >= 1 && (
          <>
            <EligibilityPlansButtons
              eligibilityPlans={eligibilityPlans}
              currentPlanIndex={currentPlanIndex}
              setCurrentPlanIndex={setCurrentPlanIndex}
            />
            <div className={s.scheduleArea}>
              <div className={s.verticalLine} />
              <Schedule currentPlan={currentPlan} />
              <TotalBlock currentPlan={currentPlan} />
            </div>
          </>
        )}
      </ModalComponent>
    </Modal>
  )
}
export default EligibilityModal
