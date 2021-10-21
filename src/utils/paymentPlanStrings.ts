import { EligibilityPlan } from 'types'
import { priceFromCents } from 'utils'

export const paymentPlanShorthandName = (payment: EligibilityPlan): string => {
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

export const paymentPlanInfoTextDeferred = (
  payment: EligibilityPlan,
  deferredDays: number,
): string => {
  const date = new Date()
  date.setDate(date.getDate() + deferredDays)
  return `${priceFromCents(
    payment.payment_plan[0].total_amount,
  )} € à payer le ${new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    day: '2-digit',
  }).format(date)} `
}
export const paymentPlanInfoTextInstallements = (payment: EligibilityPlan): string => {
  return `${payment.installments_count} mensualités de ${priceFromCents(
    payment.payment_plan[0].purchase_amount,
  )} € ${paymentPlanFeesText(payment)}`
}
export const paymentPlanInfoTextDeferredInstallements = (
  payment: EligibilityPlan,
  deferredDays: number,
): string => {
  console.warn('TODO')
  return `payez en plusieurs fois avec Alma`
}

export const paymentPlanInfoText = (payment: EligibilityPlan): string => {
  const deferredDays = payment.deferred_days + payment.deferred_months * 30
  if (deferredDays !== 0 && payment.installments_count === 1) {
    return paymentPlanInfoTextDeferred(payment, deferredDays)
  } else if (deferredDays !== 0) {
    return paymentPlanInfoTextDeferredInstallements(payment, deferredDays)
  } else if (payment.installments_count > 0) {
    return paymentPlanInfoTextInstallements(payment)
  }
  return `Payez en plusieurs fois avec Alma`
}

export const paymentPlanFeesText = (payment: EligibilityPlan): string => {
  if (payment.customer_total_cost_amount) return '(+ frais)'
  return '(sans frais)'
}
