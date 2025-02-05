import React, { FunctionComponent, useState } from 'react'

import { FormattedMessage } from 'react-intl'
import { useMediaQuery } from 'react-responsive'

import { Card, EligibilityPlan, statusResponse } from '@/types'
import { desktopWidth, isP1X } from '@/utils'
import TotalBlock from 'components/Installments/TotalBlock'
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator'
import Modal from 'components/Modal'
import EligibilityPlansButtons from 'Widgets/EligibilityModal/components/EligibilityPlansButtons'
import Schedule from 'Widgets/EligibilityModal/components/Schedule'
import DesktopModal from 'Widgets/EligibilityModal/DesktopModal'
import s from 'Widgets/EligibilityModal/EligibilityModal.module.css'
import MobileModal from 'Widgets/EligibilityModal/MobileModal'

type Props = {
  initialPlanIndex?: number
  onClose: (event: React.MouseEvent | React.KeyboardEvent) => void
  eligibilityPlans: EligibilityPlan[]
  status: statusResponse
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
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)
  const currentPlan = eligiblePlans[currentPlanIndex]

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
        {status === statusResponse.PENDING && (
          <div className={s.loader}>
            <LoadingIndicator />
          </div>
        )}
        {status === statusResponse.SUCCESS && eligiblePlans.length === 0 && (
          <div className={s.noEligibility}>
            <FormattedMessage
              id="eligibility-modal.no-eligibility"
              defaultMessage="Oups, il semblerait que la simulation n'ait pas fonctionné."
            />
          </div>
        )}
        {status === statusResponse.SUCCESS && eligiblePlans.length >= 1 && (
          <>
            <EligibilityPlansButtons
              eligibilityPlans={eligiblePlans}
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
