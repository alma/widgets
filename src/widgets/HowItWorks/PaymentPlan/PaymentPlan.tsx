import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'

import { integer } from '@/types'
import { Amount } from '@/components/Amount'

import { Installment, Placeholder } from './Installment'
import { humanizedDate } from '@/utils'

export type PlanDetailsProps = {
  plan: IPaymentPlan | null
}

function planFullAmount(plan: IPaymentPlan): integer {
  return plan.map((p) => p.purchase_amount + p.customer_fee).reduce((full, amount) => full + amount)
}

function addMonths(date: Date, months: integer): Date {
  const d = date.getDate()
  date.setMonth(date.getMonth() + +months)
  if (date.getDate() != d) {
    date.setDate(0)
  }
  return date
}

export function PaymentPlan({ plan }: PlanDetailsProps): JSX.Element {
  // If not plan has been provided, display a pulsing placeholder
  if (!plan) {
    const today = new Date()

    return (
      <div className="atw-space-y-4 atw-animate-pulse atw-text-orange-900 atw-opacity-25">
        <Placeholder label={humanizedDate(today, true)} />
        <Placeholder label={humanizedDate(addMonths(today, 1), true)} />
        <Placeholder label={humanizedDate(addMonths(today, 2), true)} />
        <hr className="atw-border-orange-900 atw-opacity-25" />
        <Placeholder label="Total" />
      </div>
    )
  }

  return (
    <div>
      {plan.map((i, idx) => (
        <Installment key={idx} installment={i} />
      ))}
      <hr className="atw-border-blue atw-opacity-50" />
      <div className="atw-flex atw-flex-row atw-justify-between atw-pt-4 alma-title-text">
        <span>Total</span>
        <Amount cents={planFullAmount(plan)} />
      </div>
    </div>
  )
}
