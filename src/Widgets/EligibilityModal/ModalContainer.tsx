import useFetchEligibility from 'hooks/useFetchEligibility'
import React from 'react'
import { ApiConfig, Card, ConfigPlan } from 'types'
import EligibilityModal from '.'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
  onClose: () => void
  cards?: Card[]
}

/**
 * This component allows to display only the modal, without PaymentPlans.
 */
const ModalContainer: React.FC<Props> = ({
  purchaseAmount,
  apiData,
  configPlans,
  customerBillingCountry,
  customerShippingCountry,
  onClose,
  cards,
}) => {
  const [eligibilityPlans, status] = useFetchEligibility(
    purchaseAmount,
    apiData,
    configPlans,
    customerBillingCountry,
    customerShippingCountry,
  )

  return (
    <EligibilityModal
      initialPlanIndex={0}
      onClose={onClose}
      eligibilityPlans={eligibilityPlans}
      status={status}
      cards={cards}
    />
  )
}

export default ModalContainer
