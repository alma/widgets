import React, { FunctionComponent, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'
import { useMediaQuery } from 'react-responsive'

import { Card, EligibilityPlan, statusResponse } from '@/types'
import { desktopWidth, isP1X } from '@/utils'
import TotalBlock from 'components/Installments/TotalBlock'
import { LoadingIndicator } from 'components/LoadingIndicator/LoadingIndicator'
import Modal from 'components/Modal'
import SkipLinks from 'components/SkipLinks'
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
  const intl = useIntl()

  const isSomePlanDeferred = eligibilityPlans.some(
    (plan) => plan.deferred_days > 0 || plan.deferred_months > 0,
  )

  // Skip links definition for RGAA accessibility
  // Towards the 3 main sections that users may want to quickly consult
  const skipLinks = [
    {
      href: '#payment-plans',
      labelId: 'skip-links.payment-plans',
      defaultMessage: intl.formatMessage({
        id: 'skip-links.payment-plans',
        defaultMessage: 'Allez aux options de paiements',
      }),
    },
    {
      href: '#payment-info',
      labelId: 'skip-links.payment-info',
      defaultMessage: intl.formatMessage({
        id: 'skip-links.payment-info',
        defaultMessage: 'Allez aux informations de paiement',
      }),
    },
    {
      href: '#payment-schedule',
      labelId: 'skip-links.payment-schedule',
      defaultMessage: intl.formatMessage({
        id: 'skip-links.payment-schedule',
        defaultMessage: 'Allez au calendrier de paiements',
      }),
    },
  ]

  return (
    <Modal
      onClose={onClose}
      ariaHideApp={false}
      scrollable
      isOpen
      aria-labelledby="eligibility-modal"
    >
      <SkipLinks skipLinks={skipLinks} />
      <ModalComponent
        isSomePlanDeferred={isSomePlanDeferred}
        cards={cards}
        isCurrentPlanP1X={isP1X(currentPlan)}
      >
        {status === statusResponse.PENDING && (
          <div className={s.loader} role="status" aria-live="polite">
            <LoadingIndicator />
          </div>
        )}
        {status === statusResponse.SUCCESS && eligiblePlans.length === 0 && (
          <div className={s.noEligibility} role="alert">
            <FormattedMessage
              id="eligibility-modal.no-eligibility"
              defaultMessage="Oups, il semblerait que la simulation n'ait pas fonctionné."
            />
          </div>
        )}
        {status === statusResponse.SUCCESS && eligiblePlans.length >= 1 && (
          <>
            <section aria-labelledby="payment-plans-title">
              <EligibilityPlansButtons
                id="payment-plans"
                eligibilityPlans={eligiblePlans}
                currentPlanIndex={currentPlanIndex}
                setCurrentPlanIndex={setCurrentPlanIndex}
              />
            </section>
            <section className={s.scheduleArea} aria-labelledby="payment-schedule-title">
              <div className={s.verticalLine} />
              <Schedule id="payment-schedule" currentPlan={currentPlan} />
              <TotalBlock currentPlan={currentPlan} />
            </section>
          </>
        )}
      </ModalComponent>
    </Modal>
  )
}
export default EligibilityModal
