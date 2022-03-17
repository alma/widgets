import LogoIcon from 'assets/Logo'
import Modal from 'components/Modal'
import React, { FunctionComponent, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { EligibilityPlan } from 'types'
import s from './EligibilityModal.module.css'
import EligibilityPlans from './EligibilityPlans'
import Info from './Info'
import Installments from './Installments'

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
  const currentPlan = eligibilityPlans[currentPlanIndex]

  return (
    <Modal onClose={onClose} ariaHideApp={false} scrollable isOpen>
      <div className={s.container} data-testid="modal-container">
        <div className={s.title} data-testid="modal-title-element">
          <FormattedMessage
            id="eligibility-modal.title"
            defaultMessage="<highlighted>Payez en plusieurs fois</highlighted> ou plus tard par carte bancaire avec Alma."
            values={{ highlighted: (...chunks: string[]) => <span>{chunks}</span> }}
          />
        </div>
        <EligibilityPlans
          eligibilityPlans={eligibilityPlans}
          currentPlanIndex={currentPlanIndex}
          setCurrentPlanIndex={setCurrentPlanIndex}
        />
        <Installments currentPlan={currentPlan} />
        <Info />
        <div className={s.logo}>
          <LogoIcon underlineColor="#FF414D" />
        </div>
        <div className={s.invisibleHackElement}></div>
      </div>
    </Modal>
  )
}
export default EligibilityModal
