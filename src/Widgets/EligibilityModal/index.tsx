import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Modal from 'components/Modal'
import { isToday } from 'date-fns'
import React, { FunctionComponent, useState } from 'react'
import { FormattedDate, FormattedMessage, FormattedNumber, useIntl } from 'react-intl'
import { EligibilityPlan } from 'types'
import { priceFromCents } from 'utils'
import { paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import s from './EligibilityModal.module.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  eligibilityPlans: EligibilityPlan[]
}
const EligibilityModal: FunctionComponent<Props> = ({ isOpen, onClose, eligibilityPlans }) => {
  const intl = useIntl()
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0)

  const currentPlan = eligibilityPlans[currentPlanIndex]
  const total =
    currentPlan &&
    priceFromCents(currentPlan.purchase_amount + currentPlan.customer_total_cost_amount)
  const creditCost = currentPlan ? priceFromCents(currentPlan.customer_total_cost_amount) : 0
  const TAEG = currentPlan?.annual_interest_rate && currentPlan.annual_interest_rate / 10000
  const customerFees = priceFromCents(currentPlan ? currentPlan.customer_total_cost_amount : 0)
  const isCredit = currentPlan && currentPlan.installments_count > 4

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollable ariaHideApp={false}>
      <div className={s.container}>
        <div className={s.title} data-testid="modal-title-element">
          <span>Payez en plusieurs fois</span> ou plus tard par carte bancaire avec Alma.
        </div>
        <div className={s.buttons}>
          {eligibilityPlans.map((eligibilityPlan, index) => (
            <button
              key={index}
              className={cx({ [s.active]: index === currentPlanIndex })}
              onClick={() => setCurrentPlanIndex(index)}
            >
              {paymentPlanShorthandName(eligibilityPlan)}
            </button>
          ))}
        </div>
        <div className={s.schedule} data-testid="modal-installments-element">
          <div className={cx(s.scheduleLine, s.total)}>
            <span>
              <FormattedMessage id="eligibility-modal.total" defaultMessage="Total" />
            </span>
            <span>
              <FormattedNumber value={total} style="currency" currency="EUR" />
            </span>
          </div>
          <div className={cx(s.scheduleLine, s.creditCost)}>
            {isCredit ? <span>Dont coût du crédit</span> : <span>Dont frais</span>}
            <span>
              {isCredit ? (
                <FormattedMessage
                  id="eligibility-modal.credit-cost"
                  defaultMessage="{creditCost} (TAEG {TAEG})"
                  values={{
                    creditCost: intl.formatNumber(creditCost, {
                      style: 'currency',
                      currency: 'EUR',
                    }),
                    TAEG: intl.formatNumber(TAEG ?? 0, {
                      style: 'percent',
                      maximumFractionDigits: 2,
                    }),
                  }}
                />
              ) : (
                <FormattedNumber value={customerFees} style="currency" currency="EUR" />
              )}
            </span>
          </div>
          {(currentPlan?.payment_plan || []).map((installment, index) => (
            <div className={s.scheduleLine} key={index}>
              <span>
                {isToday(installment.due_date * 1000) ? (
                  <FormattedMessage id="installments.today" defaultMessage="Aujourd'hui" />
                ) : (
                  <FormattedDate
                    value={installment.due_date * 1000}
                    day="numeric"
                    month="long"
                    year="numeric"
                  />
                )}
              </span>
              <span>
                <FormattedNumber
                  value={priceFromCents(installment.total_amount)}
                  style="currency"
                  currency="EUR"
                />
              </span>
            </div>
          ))}
          {isCredit && (
            <p className={s.creditMessage}>
              <FormattedMessage
                defaultMessage="Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement
              avant de vous engager."
              />
            </p>
          )}
        </div>
        <div className={s.list} data-testid="modal-info-element">
          <div className={s.listItem}>
            <div className={s.bullet}>1</div>
            <div>
              <FormattedMessage
                defaultMessage="Choisissez <strong>Alma</strong> au moment du paiement."
                values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
              />
            </div>
          </div>
          <div className={s.listItem}>
            <div className={s.bullet}>2</div>
            <div>
              Renseignez les <strong>informations</strong> demandées.
            </div>
          </div>
          <div className={s.listItem}>
            <div className={s.bullet}>3</div>
            <div>
              La validation de votre paiement <strong>instantanée</strong> !
            </div>
          </div>
        </div>
        <div className={s.logo}>
          <LogoIcon underlineColor="#FF414D" />
        </div>
      </div>
    </Modal>
  )
}
export default EligibilityModal
