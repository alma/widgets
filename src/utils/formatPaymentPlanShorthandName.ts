import { EligibilityPlan } from 'types'

export const formatPaymentPlanShorthandName = (payment: EligibilityPlan) => {
  let result = `${payment.installments_count}x`
  if (payment.deferred_days !== 0 || payment.deferred_months !== 0) {
    const defered_count = payment.deferred_days + payment.deferred_months * 30
    if (payment.installments_count === 1) {
      result = 'J'
    }
    result += `+${defered_count}`
  }
  return result
}
