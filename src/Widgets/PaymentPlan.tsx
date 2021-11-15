import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { ApiConfig, apiStatus, configPlans } from 'types'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: configPlans[]
  transitionDelay?: number
}
const defaultConfigPlans = [
  {
    installmentsCount: 3,
    minAmount: 0,
    maxAmount: 200000,
  },
  {
    installmentsCount: 4,
    minAmount: 10000,
    maxAmount: 200000,
  },
]
const PaymentPlanWidget: React.FC<Props> = ({
  purchaseAmount,
  apiData,
  configPlans,
  transitionDelay,
}) => {
  const [eligibilityPlans, status, reloadEligibility] = useFetchEligibility(
    purchaseAmount,
    apiData,
    configPlans ? configPlans : defaultConfigPlans,
  )
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const activePlanKeys = eligibilityPlans
    .map((plan, key) => {
      if (plan.eligible) return key
      return undefined
    })
    .filter((key) => key !== undefined) as number[]

  const { current, onHover, onLeave } = useButtonAnimation(
    activePlanKeys,
    transitionDelay ? transitionDelay : 5500,
  )

  if (status === apiStatus.PENDING) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }

  if (status === apiStatus.FAILED) {
    return (
      <div className={s.widgetButton}>
        <div className={cx(s.primaryContainer, s.error)}>
          <LogoIcon color="#00425D" className={s.logo} />
          <div>
            <span className={s.errorText}>
              <FormattedMessage
                defaultMessage="Quelque chose n'a pas fonctionné... <a>Réessayer</a>"
                values={{
                  a: (...chunks: string[]) => (
                    <a className={s.errorButton} onClick={reloadEligibility}>
                      {chunks}
                    </a>
                  ),
                }}
              />
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button onClick={openModal} className={s.widgetButton} data-testid="widget-button">
        <div className={s.primaryContainer}>
          <LogoIcon className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => (
              <div
                onMouseOver={() => onHover(key)}
                onMouseOut={() => onLeave()}
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
        onClose={closeModal}
        eligibilityPlans={eligibilityPlans.filter((plan) => plan.eligible)}
      />
    </>
  )
}
export default PaymentPlanWidget
