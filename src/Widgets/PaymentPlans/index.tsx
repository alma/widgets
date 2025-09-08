import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react'

import cx from 'classnames'
import { useIntl } from 'react-intl'

import { ApiConfig, Card, ConfigPlan, statusResponse } from '@/types'
import { AlmaLogo } from 'assets/almaLogo'
import Loader from 'components/Loader'
import { useAnimationInstructions } from 'hooks/useAnimationInstructions'
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

const DEFAULT_TRANSITION_TIME = 5500

/**
 * PaymentPlanWidget - Main widget component that displays Alma payment plan options
 *
 * This component shows eligible payment plans in a compact widget format with:
 * - Automatic plan cycling animation
 * - Keyboard navigation between plans
 * - Screen reader announcements for accessibility
 * - Modal opening for detailed plan information
 */
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

  // Fetch eligibility data for all payment plans
  const [eligibilityPlans, status] = useFetchEligibility(
    purchaseAmount,
    apiData,
    configPlans,
    customerBillingCountry,
    customerShippingCountry,
  )

  // Memoized array of only eligible plans to avoid unnecessary re-renders
  const eligiblePlans = useMemo(
    () => eligibilityPlans.filter((plan) => plan.eligible),
    [eligibilityPlans],
  )

  // Determine which plan should be active initially based on merchant preferences
  const activePlanIndex = getIndexOfActivePlan({
    eligibilityPlans,
    suggestedPaymentPlan: suggestedPaymentPlan ?? 0,
  })

  // Check if merchant has specified a suggested payment plan
  const isSuggestedPaymentPlanSpecified = suggestedPaymentPlan !== undefined // 👈  The merchant decided to focus a tab

  // Modal state management
  const [isOpen, setIsOpen] = useState(false)
  const { announceText, announce } = useAnnounceText()
  const openModal = () => setIsOpen(true)
  const closeModal = (event: React.MouseEvent | React.KeyboardEvent) => {
    setIsOpen(false)
    onModalClose?.(event)
  }

  // Track if user has manually interacted with plans to stop automatic animation
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Memoized array of eligible plan indices for keyboard navigation
  const eligiblePlanKeys = useMemo(
    () =>
      eligibilityPlans.reduce<number[]>(
        (acc, plan, index) => (plan.eligible ? [...acc, index] : acc),
        [],
      ),
    [eligibilityPlans],
  )

  /**
   * Calculate the appropriate transition time based on merchant configuration
   * If merchant specify a suggestedPaymentPlan and no transition, we disable animation.
   * Otherwise, we set the transition delay specified by the merchant.
   * If none of those properties are specified, we set a default transition delay.
   * @returns {number} The transition time in milliseconds
   */
  const realTransitionTime = useMemo((): number => {
    if (isSuggestedPaymentPlanSpecified && !transitionDelay) {
      return -1 // Disable animation
    }
    return transitionDelay ?? DEFAULT_TRANSITION_TIME
  }, [transitionDelay, isSuggestedPaymentPlanSpecified])

  // Hook for managing plan cycling animation and user interactions
  const { current, onHover, onLeave } = useButtonAnimation(eligiblePlanKeys, realTransitionTime)

  // Refs for managing focus on plan buttons during keyboard navigation
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Initialize button refs array when eligibility plans change
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, eligibilityPlans.length)
  }, [eligibilityPlans.length])

  // Announce plan changes to screen readers for accessibility
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
    // Note: eligibilityPlans is intentionally excluded from dependencies to prevent render loops
    // since it's recreated on every render by useFetchEligibility
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, intl, status, announce])

  // Set initial active plan when API response is received and merchant has specified a suggestion
  useEffect(() => {
    // When API has given a response AND the merchant set an active plan by default.
    if (status === statusResponse.SUCCESS && isSuggestedPaymentPlanSpecified) {
      onHover(activePlanIndex) // We select the first active plan possible
      onLeave() // We need to call onLeave to reset the animation
    }
    // We intentionally exclude 'activePlanIndex', 'isSuggestedPaymentPlanSpecified', 'onHover', and 'onLeave'
    // because including them would cause the effect to re-run unnecessarily, leading to unwanted behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Announce animation control instructions to screen readers on initial load
  useAnimationInstructions({
    status,
    hasUserInteracted,
    eligiblePlansCount: eligiblePlans.length,
    transitionDelay,
  })

  /**
   * Handle user hover interaction - stops animation permanently
   * @param index - Plan index to hover
   */
  const handleUserHover = (index: number) => {
    setHasUserInteracted(true)
    onHover(index)
  }

  /**
   * Handle user leave interaction - only restart animation if user hasn't interacted manually
   */
  const handleUserLeave = () => {
    if (!hasUserInteracted) {
      onLeave()
    }
  }

  /**
   * Navigate to the next or previous eligible plan and focus the corresponding button
   * Used for arrow key navigation between payment plans
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
    // Mark as user interaction to stop animation permanently
    setHasUserInteracted(true)
    onHover(newPlanIndex)

    // Focus the new button for keyboard users
    buttonRefs.current[newPlanIndex]?.focus()
  }

  /**
   * Navigate to first or last eligible plan
   * Used for Home/End key navigation
   * @param position - 'first' or 'last'
   */
  const navigateToEdgePlan = (position: 'first' | 'last') => {
    const planIndex =
      position === 'first' ? eligiblePlanKeys[0] : eligiblePlanKeys[eligiblePlanKeys.length - 1]
    // Mark as user interaction to stop animation permanently
    setHasUserInteracted(true)
    onHover(planIndex)
    buttonRefs.current[planIndex]?.focus()
  }

  /**
   * Convert a plan index to its position within the eligible plans array
   * Used for modal initialization to show the correct plan
   *
   * @param {number} planIndex - The index of the plan that the user has selected.
   * @returns The index of the planKey in the eligiblePlanKeys array.
   */
  const getIndexWithinEligiblePlans = (planIndex: number) => {
    const index = eligiblePlanKeys.findIndex((planKey) => planKey === planIndex)
    return index === -1 ? 0 : index
  }

  // Show loading state while fetching eligibility data
  if (status === statusResponse.PENDING) {
    return (
      <div className={cx(s.widgetContainer, s.pending)}>
        <Loader />
      </div>
    )
  }

  // Hide widget if no eligible plans and merchant wants to hide it, or if API failed
  if (
    (hideIfNotEligible && eligiblePlans.length === 0) ||
    eligibilityPlans.length === 0 ||
    status === statusResponse.FAILED
  ) {
    return null
  }

  /**
   * Handle opening the eligibility modal
   * Prevents default behavior and only opens if there are eligible plans
   */
  const handleOpenModal = (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()
    if (eligiblePlans.length > 0) {
      openModal()
    }
  }

  return (
    <>
      {/* Main widget container with proper landmark structure for RGAA 12.6 */}
      <main
        role="main"
        aria-label={intl.formatMessage({
          id: 'accessibility.payment-widget.main.aria-label',
          defaultMessage: 'Sélection des options de paiement Alma',
        })}
        className={cx(
          s.widgetContainer,
          {
            [s.hideBorder]: hideBorder,
            [s.monochrome]: monochrome,
          },
          STATIC_CUSTOMISATION_CLASSES.container,
        )}
        data-testid="widget-container"
      >
        {/* Primary payment plan selection section */}
        <section
          aria-labelledby="payment-plans-title"
          className={cx(s.primaryContainer, STATIC_CUSTOMISATION_CLASSES.eligibilityLine)}
        >
          {/* Screen reader only title for the payment plans section */}
          <h2 id="payment-plans-title" className="sr-only">
            {intl.formatMessage({
              id: 'accessibility.payment-plans.section-title',
              defaultMessage: 'Options de paiement disponibles',
            })}
          </h2>

          <button
            type="button"
            onClick={handleOpenModal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleOpenModal(e)
              }
            }}
            className={cx(
              s.knowMore,
              s.clickable,
              { [s.monochrome]: monochrome },
              STATIC_CUSTOMISATION_CLASSES.knowMoreAction,
            )}
            aria-label={intl.formatMessage({
              id: 'accessibility.payment-widget.open-button.aria-label',
              defaultMessage: 'Ouvrir les options de paiement Alma pour en savoir plus',
            })}
            aria-haspopup="dialog"
            aria-describedby="payment-info-text"
          >
            <AlmaLogo
              data-testid="Alma-Logo"
              className={s.logo}
              color={monochrome ? 'var(--off-black)' : undefined}
            />
          </button>

          {/* Payment plans selection buttons */}
          <div
            className={cx(s.paymentPlans, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}
            role="listbox"
            aria-label={intl.formatMessage({
              id: 'accessibility.payment-options.listbox.aria-label',
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
                  // Mouse/touch interactions for plan selection
                  onMouseEnter={() => handleUserHover(key)}
                  onTouchStart={() => handleUserHover(key)}
                  onMouseLeave={handleUserLeave}
                  onBlur={handleUserLeave}
                  onTouchEnd={handleUserLeave}
                  // Focus handling for keyboard users
                  onFocus={isEligible ? () => handleUserHover(key) : undefined}
                  // Keyboard navigation between eligible plans
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
                  // Click to select plan and open modal
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
                  className={cx(s.planButton, {
                    [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: isCurrent,
                    [s.monochrome]: monochrome && isCurrent,
                    [cx(s.notEligible, STATIC_CUSTOMISATION_CLASSES.notEligibleOption)]:
                      !isEligible,
                  })}
                  // Accessibility attributes for screen readers
                  role="option"
                  aria-selected={isCurrent}
                  aria-describedby="payment-info-text"
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
                  }} // Assign ref for keyboard navigation focus management
                >
                  {paymentPlanShorthandName(eligibilityPlan)}
                </button>
              )
            })}
          </div>
        </section>

        {/* Complementary information section */}
        <aside aria-labelledby="payment-info-title" className={s.infoContainer}>
          {/* Screen reader only title for the information section */}
          <h3 id="payment-info-title" className="sr-only">
            {intl.formatMessage({
              id: 'accessibility.payment-info.section-title',
              defaultMessage: 'Informations sur le plan de paiement sélectionné',
            })}
          </h3>

          {/* Payment plan information text */}
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
        </aside>
      </main>

      {/* Eligibility modal for detailed plan information */}
      {isOpen && (
        <EligibilityModal
          initialPlanIndex={getIndexWithinEligiblePlans(current)}
          onClose={closeModal}
          eligibilityPlans={eligiblePlans}
          status={status}
          cards={cards}
        />
      )}

      {/* Screen reader announcement area for accessibility */}
      <div role="alert" aria-live="assertive" className={s.announceText}>
        {announceText}
      </div>
    </>
  )
}

export default PaymentPlanWidget
