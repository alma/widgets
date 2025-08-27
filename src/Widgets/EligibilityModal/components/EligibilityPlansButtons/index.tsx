import React, { FC, useEffect, useRef } from 'react'

import cx from 'classnames'
import { FormattedMessage, useIntl } from 'react-intl'

import { EligibilityPlan } from '@/types'
import { paymentPlanShorthandName, paymentPlanShorthandText } from 'utils/paymentPlanStrings'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/EligibilityPlansButtons/EligibilityPlansButtons.module.css'

const EligibilityPlansButtons: FC<{
  eligibilityPlans: EligibilityPlan[]
  currentPlanIndex: number
  // eslint-disable-next-line no-unused-vars
  setCurrentPlanIndex: (index: number) => void
  id?: string
}> = ({ eligibilityPlans, currentPlanIndex, setCurrentPlanIndex, id }) => {
  const intl = useIntl()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Initialize button refs array
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, eligibilityPlans.length)
  }, [eligibilityPlans.length])

  /**
   * Navigate to plan and focus the corresponding button
   * @param newIndex - Target plan index
   */
  const navigateToPlan = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < eligibilityPlans.length) {
      setCurrentPlanIndex(newIndex)
      // Focus the new button
      setTimeout(() => buttonRefs.current[newIndex]?.focus(), 0)
    }
  }

  return (
    <div>
      <h2 id="payment-plans-title" className="sr-only">
        <FormattedMessage
          id="accessibility.payment-plans-title"
          defaultMessage="Options de paiement disponibles"
        />
      </h2>
      <div
        id={id}
        className={cx(s.buttons, STATIC_CUSTOMISATION_CLASSES.eligibilityOptions)}
        role="group"
        aria-labelledby="payment-plans-title"
      >
        {eligibilityPlans.map((eligibilityPlan, key) => (
          <button
            type="button"
            key={`p${eligibilityPlan.installments_count}x-d+${eligibilityPlan.deferred_days}-m+${eligibilityPlan.deferred_months}`}
            className={cx({
              [cx(s.active, STATIC_CUSTOMISATION_CLASSES.activeOption)]: key === currentPlanIndex,
            })}
            onClick={() => setCurrentPlanIndex(key)}
            onKeyDown={(e) => {
              // Arrow navigation between plans
              if (e.key === 'ArrowLeft') {
                e.preventDefault()
                navigateToPlan(key - 1)
              } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                navigateToPlan(key + 1)
              } else if (e.key === 'Home') {
                e.preventDefault()
                navigateToPlan(0)
              } else if (e.key === 'End') {
                e.preventDefault()
                navigateToPlan(eligibilityPlans.length - 1)
              }
            }}
            aria-pressed={key === currentPlanIndex}
            aria-describedby="payment-info"
            aria-current={key === currentPlanIndex ? 'true' : undefined}
            aria-label={intl.formatMessage(
              {
                id: 'accessibility.payment-plan-button.aria-label',
                defaultMessage: 'Sélectionner le plan de paiement {planName}',
              },
              { planName: paymentPlanShorthandText(eligibilityPlan, intl) },
            )}
            ref={(el) => {
              buttonRefs.current[key] = el
            }}
          >
            <span className={s.textButton}>{paymentPlanShorthandName(eligibilityPlan)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EligibilityPlansButtons
