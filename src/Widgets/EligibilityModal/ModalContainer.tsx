import React from 'react'
import { ApiConfig, Card, ConfigPlan } from 'types'
import EligibilityModal from '.'
import { useEligibilityQuery } from 'hooks/useEligibility'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
  onClose: (event: React.MouseEvent | React.KeyboardEvent) => void
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
  const { data, status } = useEligibilityQuery(apiData, {
    purchaseAmount,
    plans: configPlans,
    customerBillingCountry,
    customerShippingCountry,
  })
  const eligibilityPlans = data ?? []

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
