import React, { FunctionComponent, useState } from 'react'
import Modal from 'components/Modal'
import { EligibilityPlan } from 'types'
import { useMediaQuery } from 'react-responsive'

import DesktopModal from './DesktopModal'
import MobileModal from './MobileModal'

type Props = {
  initialPlanIndex?: number
  onClose: () => void
  eligibilityPlans: EligibilityPlan[]
}

const EligibilityModal: FunctionComponent<Props> = ({
  initialPlanIndex,
  onClose,
  eligibilityPlans,
}) => {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(initialPlanIndex || 0)
  const isBigScreen = useMediaQuery({ minWidth: 800 })
  const currentPlan = eligibilityPlans[currentPlanIndex]
  const modalProps = {
    eligibilityPlans,
    currentPlanIndex,
    setCurrentPlanIndex,
    currentPlan,
  }

  return (
    <Modal onClose={onClose} ariaHideApp={false} scrollable isOpen>
      {isBigScreen ? <DesktopModal {...modalProps} /> : <MobileModal {...modalProps} />}
    </Modal>
  )
}
export default EligibilityModal
