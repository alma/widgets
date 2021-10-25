import React, { useState } from 'react'

import { ApiConfig, Plans } from 'types'
import useFetchEligibility from 'hooks/useFetchEligibility'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'
import LogoIcon from 'assets/Logo'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import cx from 'classnames'
import useButtonAnimation from 'hooks/useButtonAnimation'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  plans?: Plans[]
}

const PaymentPlanWidget: React.FC<Props> = ({ purchaseAmount, apiData, plans }) => {
  const eligibilityPlans = useFetchEligibility(purchaseAmount, apiData, plans)
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const [current, setCurrent] = useButtonAnimation(
    eligibilityPlans
      .map((plan, key) => {
        if (plan.eligible) return key
        return undefined
      })
      .filter((key) => key !== undefined) as number[],
  )

  const handleHover = (key: number) => {
    setCurrent(key)
  }
  return (
    <>
      <button onClick={openModal} className={s.widgetButton} data-testid="widget-button">
        <div className={s.primaryContainer}>
          <LogoIcon color="#00425D" className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => (
              <div
                onMouseOver={() => handleHover(key)}
                key={key}
                className={cx(s.plan, {
                  [s.active]: current === key,
                  [s.notEligible]: !eligibilityPlan.eligible,
                })}
              >
                {paymentPlanShorthandName(eligibilityPlan)}
              </div>
            ))}
          </div>
        </div>
        <div
          className={cx(s.info, {
            [s.notEligible]: eligibilityPlans[current] && !eligibilityPlans[current].eligible,
          })}
        >
          {eligibilityPlans.length !== 0 && paymentPlanInfoText(eligibilityPlans[current])}
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
