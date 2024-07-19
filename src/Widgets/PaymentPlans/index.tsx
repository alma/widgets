import { AlmaLogo } from 'assets/almaLogo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import React, { MouseEvent, useEffect, useState, VoidFunctionComponent } from 'react'
import { ApiConfig, Card, ConfigPlan } from 'types'
import { getIndexOfActivePlan } from 'utils/merchantOrderPreferences'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from 'Widgets/EligibilityModal'
import { useEligibilityQuery } from 'hooks/useEligibility'
import STATIC_CUSTOMISATION_CLASSES from './classNames.const'
import s from './PaymentPlans.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  customerBillingCountry?: string
  customerShippingCountry?: string
  hideIfNotEligible?: boolean
  monochrome?: boolean
  suggestedPaymentPlan?: number | number[]
  cards?: Card[]
  hideBorder?: boolean
  onModalClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
}

const VERY_LONG_TIME_IN_MS = 1000 * 3600
const DEFAULT_TRANSITION_TIME = 5500

const PaymentPlanWidget: VoidFunctionComponent<Props> = ({
  apiData,
  configPlans,
  hideIfNotEligible,
  monochrome,
  purchaseAmount,
  suggestedPaymentPlan,
  cards,
  customerBillingCountry,
  customerShippingCountry,
  transitionDelay,
  hideBorder = false,
  onModalClose,
}) => {
  const { data, status, isSuccess, isError, isLoading } = useEligibilityQuery(apiData, {
    purchaseAmount,
    plans: configPlans,
    customerBillingCountry,
    customerShippingCountry,
  })

  const eligibilityPlans = data ?? []

  const activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans,
    suggestedPaymentPlan: suggestedPaymentPlan ?? 0,
  })
  const isSuggestedPaymentPlanSpecified = suggestedPaymentPlan !== undefined // 👈  The merchant decided to focus a tab
  const isTransitionSpecified = transitionDelay !== undefined // 👈  The merchant has specified a transition time
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = (event: React.MouseEvent | React.KeyboardEvent) => {
    setIsOpen(false)
    onModalClose && onModalClose(event)
  }

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
    if (isSuccess && isSuggestedPaymentPlanSpecified) {
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
  // Return Loader when API is still fetching
  if (isLoading) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }
  const getIndexWithinEligiblePlans = (planIndex: number) => {
    const index = eligiblePlanKeys.findIndex((planKey) => planKey === planIndex)
    return index === -1 ? 0 : index
  }

  // Return null if there is an error or if there is no data
  if (
    isError ||
    (hideIfNotEligible && eligibilityPlans.length === 0) ||
    eligibilityPlans.length === 0
  ) {
    return null
  }

  const handleOpenModal = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (eligibilityPlans.length > 0) {
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
            [s.clickable]: eligibilityPlans.length > 0,
            [s.unClickable]: eligibilityPlans.length === 0,
            [s.hideBorder]: hideBorder,
          },
          STATIC_CUSTOMISATION_CLASSES.container,
        )}
        data-testid="widget-button"
      >
        <div className={cx(s.primaryContainer, STATIC_CUSTOMISATION_CLASSES.eligibilityLine)}>
          <AlmaLogo className={s.logo} color={monochrome ? 'var(--off-black)' : undefined} />
          <div className={cx(s.paymentPlans, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}>
            {eligibilityPlans.map((eligibilityPlan, key) => {
              const isCurrent = key === current
              return (
                <div
                  key={key}
                  onMouseEnter={() => {
                    onHover(key)
                  }}
                  onTouchStart={() => onHover(key)}
                  onMouseOut={onLeave}
                  onTouchEnd={onLeave}
                  className={cx(s.plan, {
                    [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: isCurrent,
                    [s.monochrome]: monochrome && isCurrent,
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
          eligibilityPlans={eligibilityPlans}
          status={status}
          cards={cards}
        />
      )}
    </>
  )
}

export default PaymentPlanWidget
