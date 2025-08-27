import React, { FunctionComponent, useEffect, useRef, useState } from 'react'

import cx from 'classnames'
import { useIntl } from 'react-intl'

import { ApiConfig, Card, ConfigPlan, statusResponse } from '@/types'
import { AlmaLogo } from 'assets/almaLogo'
import Loader from 'components/Loader'
import { useAnnounceText } from 'hooks/useAnnounceText'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import { getIndexOfActivePlan } from 'utils/merchantOrderPreferences'
import {
  getPlanDescription,
  paymentPlanInfoText,
  paymentPlanShorthandName,
} from 'utils/paymentPlanStrings'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets//PaymentPlans/classNames.const'
import EligibilityModal from 'Widgets/EligibilityModal'
import s from 'Widgets/PaymentPlans/PaymentPlans.module.css'

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

const PaymentPlanWidget: FunctionComponent<Props> = ({
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
  const intl = useIntl()
  const [eligibilityPlans, status] = useFetchEligibility(
    purchaseAmount,
    apiData,
    configPlans,
    customerBillingCountry,
    customerShippingCountry,
  )
  const eligiblePlans = eligibilityPlans.filter((plan) => plan.eligible)
  const activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans,
    suggestedPaymentPlan: suggestedPaymentPlan ?? 0,
  })
  const isSuggestedPaymentPlanSpecified = suggestedPaymentPlan !== undefined // 👈  The merchant decided to focus a tab
  const isTransitionSpecified = transitionDelay !== undefined // 👈  The merchant has specified a transition time
  const [isOpen, setIsOpen] = useState(false)
  const { announceText, announce } = useAnnounceText()
  const openModal = () => setIsOpen(true)
  const closeModal = (event: React.MouseEvent | React.KeyboardEvent) => {
    setIsOpen(false)
    onModalClose?.(event)
  }

  const eligiblePlanKeys = eligibilityPlans.reduce<number[]>(
    (acc, plan, index) => (plan.eligible ? [...acc, index] : acc),
    [],
  )

  /**
   * If merchant specify a suggestedPaymentPlan and no transition, we set a very long transition delay.
   * Otherwise, we set the transition delay specified by the merchant.
   * If none of those properties are specified, we set a default transition delay.
   * @returns {number} The transition time in milliseconds
   */
  const realTransitionTime = (): number => {
    if (isTransitionSpecified) {
      return transitionDelay ?? DEFAULT_TRANSITION_TIME
    }
    if (isSuggestedPaymentPlanSpecified) {
      return VERY_LONG_TIME_IN_MS
    }
    return DEFAULT_TRANSITION_TIME
  }

  const { current, onHover, onLeave } = useButtonAnimation(eligiblePlanKeys, realTransitionTime())

  // Refs for managing focus on plan buttons
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Initialize button refs array
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, eligibilityPlans.length)
  }, [eligibilityPlans.length])

  /**
   * Navigate to the next or previous eligible plan and focus the corresponding button
   * @param direction - 'next' or 'prev' for navigation direction
   * @param currentIndex - Current plan index
   */
  const navigateToEligiblePlan = (direction: 'next' | 'prev', currentIndex: number) => {
    const currentEligibleIndex = eligiblePlanKeys.indexOf(currentIndex)

    if (currentEligibleIndex === -1) return

    let newEligibleIndex
    if (direction === 'next') {
      newEligibleIndex = currentEligibleIndex + 1
      if (newEligibleIndex >= eligiblePlanKeys.length) return
    } else {
      newEligibleIndex = currentEligibleIndex - 1
      if (newEligibleIndex < 0) return
    }

    const newPlanIndex = eligiblePlanKeys[newEligibleIndex]
    onHover(newPlanIndex)

    // Focus the new button
    buttonRefs.current[newPlanIndex]?.focus()
  }

  /**
   * Navigate to first or last eligible plan
   * @param position - 'first' or 'last'
   */
  const navigateToEdgePlan = (position: 'first' | 'last') => {
    const planIndex =
      position === 'first' ? eligiblePlanKeys[0] : eligiblePlanKeys[eligiblePlanKeys.length - 1]
    onHover(planIndex)
    buttonRefs.current[planIndex]?.focus()
  }

  // Announce plan changes to screen readers
  useEffect(() => {
    if (eligibilityPlans[current] && status === statusResponse.SUCCESS) {
      const currentPlan = eligibilityPlans[current]

      const planDescription = getPlanDescription(currentPlan, intl)
      const announcementText = intl.formatMessage(
        {
          id: 'accessibility.plan-selection-changed',
          defaultMessage: 'Plan sélectionné : {planDescription}',
        },
        { planDescription },
      )

      announce(announcementText, 1000)
    }
  }, [current, eligibilityPlans, intl, status, announce])

  useEffect(() => {
    // When API has given a response AND the marchand set an active plan by default.
    if (status === statusResponse.SUCCESS && isSuggestedPaymentPlanSpecified) {
      onHover(activePlanIndex) // We select the first active plan possible
      onLeave() // We need to call onLeave to reset the animation
    }
    // We intentionally exclude 'activePlanIndex', 'isSuggestedPaymentPlanSpecified', 'onHover', and 'onLeave'
    // because including them would cause the effect to re-run unnecessarily, leading to unwanted behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (status === statusResponse.PENDING) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }

  if (
    (hideIfNotEligible && eligiblePlans.length === 0) ||
    eligibilityPlans.length === 0 ||
    status === statusResponse.FAILED
  ) {
    return null
  }

  const handleOpenModal = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault()
    if (eligiblePlans.length > 0) {
      openModal()
    }
  }

  return (
    <>
      <div
        onClick={handleOpenModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleOpenModal(e)
          }
        }}
        className={cx(
          s.widgetButton,
          {
            [s.clickable]: eligiblePlans.length > 0,
            [s.unClickable]: eligiblePlans.length === 0,
            [s.hideBorder]: hideBorder,
            [s.monochrome]: monochrome,
          },
          STATIC_CUSTOMISATION_CLASSES.container,
        )}
        data-testid="widget-button"
        role="button"
        tabIndex={0}
        aria-label={intl.formatMessage({
          id: 'accessibility.payment-widget.open-button.aria-label',
          defaultMessage: 'Ouvrir les options de paiement Alma',
        })}
      >
        <div className={cx(s.primaryContainer, STATIC_CUSTOMISATION_CLASSES.eligibilityLine)}>
          <AlmaLogo className={s.logo} color={monochrome ? 'var(--off-black)' : undefined} />
          <div
            className={cx(s.paymentPlans, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}
            role="radiogroup"
            aria-label={intl.formatMessage({
              id: 'accessibility.payment-options.radiogroup.aria-label',
              defaultMessage: 'Options de paiement disponibles',
            })}
          >
            {eligibilityPlans.map((eligibilityPlan, key) => {
              const isCurrent = key === current
              const isEligible = eligibilityPlan.eligible

              return (
                <button
                  type="button"
                  key={`p${eligibilityPlan.installments_count}x-d+${eligibilityPlan.deferred_days}-m+${eligibilityPlan.deferred_months}`}
                  onMouseEnter={() => onHover(key)}
                  onTouchStart={() => onHover(key)}
                  onMouseLeave={onLeave}
                  onBlur={onLeave}
                  onTouchEnd={onLeave}
                  onFocus={isEligible ? () => onHover(key) : undefined}
                  onKeyDown={(e) => {
                    if (!isEligible) return

                    // Arrow navigation between eligible plans only
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      navigateToEligiblePlan('prev', key)
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      navigateToEligiblePlan('next', key)
                    } else if (e.key === 'Home') {
                      e.preventDefault()
                      navigateToEdgePlan('first')
                    } else if (e.key === 'End') {
                      e.preventDefault()
                      navigateToEdgePlan('last')
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isEligible) {
                      onHover(key)
                      // Open modal if clicking on an eligible plan
                      if (eligiblePlans.length > 0) {
                        openModal()
                      }
                    }
                  }}
                  className={cx(s.plan, s.planButton, {
                    [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: isCurrent,
                    [s.monochrome]: monochrome && isCurrent,
                    [cx(s.notEligible, STATIC_CUSTOMISATION_CLASSES.notEligibleOption)]:
                      !isEligible,
                  })}
                  role="radio"
                  aria-checked={isCurrent}
                  aria-describedby="payment-info-text"
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={intl.formatMessage(
                    {
                      id: 'accessibility.payment-plan.option.aria-label',
                      defaultMessage: 'Option de paiement {planDescription}',
                    },
                    {
                      planDescription: getPlanDescription(eligibilityPlan, intl),
                    },
                  )}
                  aria-disabled={!isEligible}
                  tabIndex={isEligible ? 0 : -1}
                  ref={(el) => {
                    buttonRefs.current[key] = el
                  }} // Assign ref to button
                >
                  {paymentPlanShorthandName(eligibilityPlan)}
                </button>
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
          id="payment-info-text"
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
      <div role="alert" aria-live="assertive" className={s.announceText}>
        {announceText}
      </div>
    </>
  )
}

export default PaymentPlanWidget
