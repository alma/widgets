import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import React, { MouseEvent, useEffect, useState, VoidFunctionComponent } from 'react'
import { ApiConfig, apiStatus, Card, ConfigPlan } from 'types'
import { getIndexOfActivePlan } from 'utils/merchantOrderPreferences'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from 'Widgets/EligibilityModal'
import STATIC_CUSTOMISATION_CLASSES from './classNames.const'
import s from './PaymentPlans.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  hideIfNotEligible?: boolean
  monochrome: boolean
  suggestedPaymentPlan?: number | number[]
  cards?: Card[]
  hideBorder?: boolean
}

const VERY_LONG_TIME_IN_MS = 1000 * 3600 * 24 * 365
const DEFAULT_TRANSITION_TIME = 5500

const PaymentPlanWidget: VoidFunctionComponent<Props> = ({
  apiData,
  configPlans,
  hideIfNotEligible,
  monochrome,
  purchaseAmount,
  suggestedPaymentPlan,
  cards,
  transitionDelay,
  hideBorder = false
}) => {
  const [eligibilityPlans, status] = useFetchEligibility(purchaseAmount, apiData, configPlans)
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)
  const activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans,
    suggestedPaymentPlan: suggestedPaymentPlan ?? 0,
  })
  const isSuggestedPaymentPlanSpecified = suggestedPaymentPlan !== undefined // 👈  The merchant decided to focus a tab
  const isTransitionSpecified = transitionDelay !== undefined // 👈  The merchant has specified a transition time
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const eligiblePlanKeys = eligibilityPlans.reduce<number[]>(
    (acc, plan, index) => (plan.eligible ? [...acc, index] : acc),
    [],
  )

  /**
   * If merchand specify a suggestedPaymentPlan and no transition, we set a very long transition delay.
   * Otherwise, we set the transition delay specified by the merchant.
   * If none of those properties are specified, we set a default transition delay.
   * @returns
   */
  const realTransitionTime = () => {
    if (isTransitionSpecified) {
      return transitionDelay ?? DEFAULT_TRANSITION_TIME
    }
    if (isSuggestedPaymentPlanSpecified) {
      return VERY_LONG_TIME_IN_MS
    }
    return DEFAULT_TRANSITION_TIME
  }

  const { current, onHover, onLeave } = useButtonAnimation(eligiblePlanKeys, realTransitionTime())

  useEffect(() => {
    // When API has given a response AND the marchand set an active plan by default.
    if (status === apiStatus.SUCCESS && isSuggestedPaymentPlanSpecified) {
      onHover(activePlanIndex) // We select the first active plan possible
      onLeave() // We need to call onLeave to reset the animation
    }
  }, [status])

  /**
   * It takes a plan index and returns the index of that plan within the eligible plans
   *
   * @param {number} planIndex - The index of the plan that the user has selected.
   * @returns The index of the planKey in the eligiblePlanKeys array.
   */
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
        className={cx(
          s.widgetButton,
          {
            [s.clickable]: eligiblePlans.length > 0,
            [s.unClickable]: eligiblePlans.length === 0,
            [s.hideBorder]: hideBorder
          },
          STATIC_CUSTOMISATION_CLASSES.container,
        )}
        data-testid="widget-button"
      >
        <div className={cx(s.primaryContainer, STATIC_CUSTOMISATION_CLASSES.eligibilityLine)}>
          <LogoIcon className={s.logo} monochrome={monochrome} />
          <div className={cx(s.paymentPlans, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}>
            {eligibilityPlans.map((eligibilityPlan, key) => {
              const isCurrent = key === current
              return (
                <div
                  key={key}
                  onMouseEnter={() => onHover(key)}
                  onTouchStart={() => onHover(key)}
                  onMouseOut={onLeave}
                  onTouchEnd={onLeave}
                  className={cx(s.plan, {
                    [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: isCurrent,
                    [s.polychrome]: !monochrome && isCurrent,
                    [cx(s.notEligible, STATIC_CUSTOMISATION_CLASSES.notEligibleOption)]:
                      !eligibilityPlan.eligible,
                  })}
                >
                  {paymentPlanShorthandName(eligibilityPlan)}
                </div>
              )
            })}
          </div>
        </div>
        <div
          className={cx(
            s.info,
            {
              [cx(s.notEligible, STATIC_CUSTOMISATION_CLASSES.notEligibleOption)]:
                eligibilityPlans[current] && !eligibilityPlans[current].eligible,
            },
            STATIC_CUSTOMISATION_CLASSES.paymentInfo,
          )}
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
          cards={cards}
        />
      )}
    </>
  )
}

export default PaymentPlanWidget
