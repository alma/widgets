import React, { useEffect, useState } from 'react'

import { ApiConfig } from 'types'
import useFetchEligibility from 'hooks/useFetchEligibility'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'
import LogoIcon from 'assets/Logo'
import {
  paymentPlanInfoText,
  paymentPlanShorthandName,
  paymentPlanFeesText,
} from 'utils/paymentPlanStrings'
import cx from 'classnames'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
}

const PaymentPlanWidget: React.FC<Props> = ({ purchaseAmount, apiData }) => {
  const eligibilityPlans = useFetchEligibility(purchaseAmount, apiData)
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const [active, setActive] = useState(0)
  let update = true
  useEffect(() => {
    if (eligibilityPlans.length !== 0) {
      setTimeout(() => {
        if (update) setActive((active + 1) % eligibilityPlans.length)
      }, 3000)
    }
  }, [eligibilityPlans, active])

  const handleHover = (key: number) => {
    update = false
    setActive(key)
  }
  return (
    <>
      <button onClick={openModal} className={s.widgetButton}>
        <div className={s.primaryContainer}>
          <LogoIcon color="#00425D" className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => (
              <div
                onMouseOver={() => handleHover(key)}
                key={key}
                className={cx(s.plan, {
                  [s.active]: active === key,
                })}
              >
                {paymentPlanShorthandName(eligibilityPlan)}
              </div>
            ))}
          </div>
        </div>
        <div className={s.info}>
          {eligibilityPlans.length !== 0 &&
            `${paymentPlanInfoText(eligibilityPlans[active])} ${paymentPlanFeesText(
              eligibilityPlans[active],
            )}`}
        </div>
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
