import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import React, { MouseEvent, useEffect, useState } from 'react'
import { ApiConfig, apiStatus, ConfigPlan } from 'types'
import { getIndexOfActivePlan } from 'utils/merchantOrderPreferences'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from 'Widgets/EligibilityModal'
import s from './PaymentPlans.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  hideIfNotEligible?: boolean
  defaultInstallmentsCount?: number | number[]
}

const VERY_LONG_TIME_IN_MS = 1000 * 3600 * 24 * 365

const PaymentPlanWidget: React.FC<Props> = ({
  purchaseAmount,
  apiData,
  configPlans,
  transitionDelay = 5550,
  hideIfNotEligible,
  defaultInstallmentsCount,
}) => {
  const [eligibilityPlans, status] = useFetchEligibility(purchaseAmount, apiData, configPlans)
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)
  const activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans,
    defaultInstallmentsCount: defaultInstallmentsCount ?? 0,
  })
  const isFixedOnActivePlan = defaultInstallmentsCount !== undefined // 👈  The merchant decided to focus a tab and remove animated transition.
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const eligiblePlanKeys = eligibilityPlans.reduce<number[]>(
    (acc, plan, index) => (plan.eligible ? [...acc, index] : acc),
    [],
  )
  const { current, onHover, onLeave } = useButtonAnimation(
    eligiblePlanKeys,
    isFixedOnActivePlan ? VERY_LONG_TIME_IN_MS : transitionDelay,
  )

  useEffect(() => {
    // TODO bien expliquer.
    status === apiStatus.SUCCESS && isFixedOnActivePlan && onHover(activePlanIndex)
  }, [status])

  const getIndexWithinEligiblePlans = (planIndex: number) => {
    const index = eligiblePlanKeys.findIndex((planKey) => planKey === planIndex)

    return index === -1 ? 0 : index
  }

  if (status === apiStatus.PENDING) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }

  if (
    (hideIfNotEligible && eligiblePlans.length === 0) ||
    eligibilityPlans.length === 0 ||
    status === apiStatus.FAILED
  ) {
    return null
  }

  const handleOpenModal = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (eligiblePlans.length > 0) {
      openModal()
    }
  }

  return (
    <>
      <div
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
              return (
                <div
                  key={key}
                  onMouseEnter={() => {
                    onHover(key)
                  }}
                  onMouseOut={onLeave}
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
      </div>
      {isOpen && (
        <EligibilityModal
          initialPlanIndex={getIndexWithinEligiblePlans(current)}
          onClose={closeModal}
          eligibilityPlans={eligiblePlans}
          status={status}
        />
      )}
    </>
  )
}

export default PaymentPlanWidget
