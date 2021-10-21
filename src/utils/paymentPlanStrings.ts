import { EligibilityPlan } from 'types'

export const paymentPlanShorthandName = (payment: EligibilityPlan) => {
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

export const paymentPlanInfoText = (payment: EligibilityPlan): string => {
  //TODO: Handle case where there are deferred days & multiple installements
  const deferred_days = payment.deferred_days + payment.deferred_months * 30
  if (deferred_days !== 0) {
    const date = new Date()
    date.setDate(date.getDate() + deferred_days)
    return `${payment.payment_plan[0].total_amount / 100} € à payer le ${new Intl.DateTimeFormat(
      'fr-FR',
      {
        month: 'long',
        day: '2-digit',
      },
    ).format(date)} `
  } else if (payment.installments_count > 0) {
    return `${payment.installments_count} mensualités de ${
      payment.payment_plan[0].purchase_amount / 100
    } € `
  }
  return `payez en plusieurs fois avec Alma`
}

export const paymentPlanFeesText = (payment: EligibilityPlan): string => {
  //TODO: Handle case where there are fees
  return '(sans frais)'
}
