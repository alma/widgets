import React, { useState } from 'react'

import { ApiConfig } from 'types'
import useFetchEligibility from 'hooks/useFetchEligibility'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'
import LogoIcon from 'assets/Logo'
import { formatPaymentPlanShorthandName } from 'utils/formatPaymentPlanShorthandName'

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
      <button onClick={openModal} className={s.widgetButton}>
        <div className={s.primaryContainer}>
          <LogoIcon color="#00425D" className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => (
              <div key={key} className={s.plan}>
                {formatPaymentPlanShorthandName(eligibilityPlan)}
              </div>
            ))}
          </div>
        </div>
        <div className={s.info}>3 mensualités de 199,67 € (sans frais)</div>
      </button>
      <EligibilityModal
        isOpen={isOpen}
        onClose={() => {
          closeModal()
        }}
      ></EligibilityModal>
    </>
  )
}
export default PaymentPlanWidget
