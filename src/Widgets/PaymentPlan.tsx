import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import React, { MouseEvent, useEffect, useState } from 'react'
import { ApiConfig, apiStatus, ConfigPlan, EligibilityPlan } from 'types'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  hideIfNotEligible?: boolean
}

const PaymentPlanWidget: React.FC<Props> = ({
  purchaseAmount,
  apiData,
  configPlans,
  transitionDelay,
  hideIfNotEligible,
}) => {
  const [eligibilityPlans, status] = useFetchEligibility(purchaseAmount, apiData, configPlans)
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)

  const [isOpen, setIsOpen] = useState(false)
  const [initialPlanIndex, setInitialPlanIndex] = useState(0)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const eligiblePlanKeys = eligibilityPlans.reduce<number[]>(
    (acc, plan, index) => (plan.eligible ? [...acc, index] : acc),
    [],
  )
  const { current, onHover, onLeave } = useButtonAnimation(
    eligiblePlanKeys,
    transitionDelay ? transitionDelay : 5500,
  )

  // This hook is needed to update the initial plan index when useButtonAnimation
  // updates the `current` value (i.e. without any hover / click callback).
  useEffect(() => {
    if (current !== initialPlanIndex) {
      setInitialPlanIndex(current)
    }
  }, [current, initialPlanIndex])

  if (status === apiStatus.PENDING) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }

  if ((hideIfNotEligible && eligiblePlans.length == 0) || eligibilityPlans.length === 0) {
    return null
  }
  if (status === apiStatus.FAILED) {
    return null
  }

  const handleOpenModal = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (eligiblePlans.length > 0) {
      openModal()
    }
  }

  const handleHoverAndClick = (key: number, newInitialPlanIndex: number) => {
    // This is needed to update the initial plan index and button style when hovering (desktop) or clicking (mobile).
    // The actual modal opening is triggered by a click on the highest parent div in `handleOpenModal`.
    onHover(key)
    setInitialPlanIndex(newInitialPlanIndex)
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={s.widgetButton}
        style={{
          cursor: eligiblePlans.length > 0 ? 'pointer' : 'initial',
        }}
        data-testid="widget-button"
      >
        <div className={s.primaryContainer}>
          <LogoIcon className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => {
              const newInitialPlanIndex = eligiblePlanKeys.includes(key)
                ? eligiblePlanKeys.findIndex((planKey) => planKey === key)
                : 0
              return (
                <div
                  onMouseEnter={() => {
                    handleHoverAndClick(key, newInitialPlanIndex)
                  }}
                  onMouseOut={() => {
                    onLeave()
                  }}
                  onClick={() => {
                    handleHoverAndClick(key, newInitialPlanIndex)
                  }}
                  key={key}
                  className={cx(s.plan, {
                    [s.active]: current === key,
                    [s.notEligible]: !eligibilityPlan.eligible,
                  })}
                >
                  {paymentPlanShorthandName(eligibilityPlan)}
                </div>
              )
            })}
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
      {/* The eligibility modal needs to reinitialize on close hence the `isOpen &&` bit */}
      {isOpen && (
        <EligibilityModal
          initialPlanIndex={initialPlanIndex}
          onClose={closeModal}
          eligibilityPlans={eligiblePlans}
          isOpen
        />
      )}
    </>
  )
}
export default PaymentPlanWidget
