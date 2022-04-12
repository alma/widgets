import useFetchEligibility from 'hooks/useFetchEligibility'
import React from 'react'
import { ApiConfig, ConfigPlan } from 'types'
import EligibilityModal from '.'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  onClose: () => void
}

/**
 * This component allows to display only the modal, without PaymentPlans.
 */
const ModalContainer: React.FC<Props> = ({ purchaseAmount, apiData, configPlans, onClose }) => {
  const [eligibilityPlans, status] = useFetchEligibility(purchaseAmount, apiData, configPlans)

  return (
    <EligibilityModal
      initialPlanIndex={0}
      onClose={onClose}
      eligibilityPlans={eligibilityPlans}
      status={status}
    />
  )
}

export default ModalContainer
