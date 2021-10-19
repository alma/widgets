import React, { useState } from 'react'

import { ApiConfig } from 'types'
import useFetchEligibility from 'hooks/useFetchEligibility'
import EligibilityModal from './EligibilityModal'
type Props = {
  purchaseAmount: number
  apiData: ApiConfig
}

const PaymentPlanWidget: React.FC<Props> = ({ purchaseAmount, apiData }) => {
  const eligibilityPlans = useFetchEligibility(purchaseAmount, apiData)
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  return (
    <>
      <button onClick={openModal}>
        <div>LOGO</div>
        <div>
          {eligibilityPlans.map((eligibilityPlan, key) => (
            <div key={key}>{eligibilityPlan.installments_count}</div>
          ))}
        </div>
        <div>3 mensualités de 199,67 € (sans frais)</div>
      </button>
      <EligibilityModal
        isOpen={isOpen}
        onClose={() => {
          closeModal()
        }}
      >
      </EligibilityModal>
    </>
  )
}
export default PaymentPlanWidget
