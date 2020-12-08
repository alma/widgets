import {
  EligibleEligibility,
  IEligibility,
  NotEligibleEligibility,
} from '@alma/client/dist/types/entities/eligibility'
import { Amount } from '@/components/Amount'
import { integer } from '@/types'

// TODO: this assumes the first payment will be made "today"; will need to adapt for Pay Later
function eligiblePlan(eligibility: EligibleEligibility): JSX.Element {
  const { payment_plan: paymentPlan } = eligibility

  const firstAmount = paymentPlan[0].purchase_amount + paymentPlan[0].customer_fee
  const nextAmount = paymentPlan[1].purchase_amount + paymentPlan[1].customer_fee

  return (
    <span>
      <Amount cents={firstAmount} /> puis {paymentPlan.length - 1}&times;
      <Amount cents={nextAmount} />
    </span>
  )
}

function nonEligiblePlan(purchaseAmount: number, eligibility: NotEligibleEligibility): JSX.Element {
  // TODO: Eligibility types need some fixing on the API Client
  const reasons = (eligibility as any).reasons
  const constraints = (eligibility as any).constraints.purchase_amount

  if (reasons || !constraints) {
    // No matter the reason, if there's one we'll just output a generic "Unavailable" text
    return <span>Indisponible</span>
  }

  if (purchaseAmount < constraints.minimum) {
    return (
      <span>
        Dès <Amount cents={constraints.minimum} />
      </span>
    )
  } else {
    return (
      <span>
        Jusqu'à <Amount cents={constraints.maximum} />
      </span>
    )
  }
}

type PlanSummaryProps = {
  purchaseAmount: integer
  eligibility: IEligibility
}

export function PlanSummary({ eligibility, purchaseAmount }: PlanSummaryProps): JSX.Element {
  if (eligibility.eligible) {
    // TODO: remove type assertion once API Client's eligibility types are fixed
    return eligiblePlan(eligibility as EligibleEligibility)
  } else {
    return nonEligiblePlan(purchaseAmount, eligibility as NotEligibleEligibility)
  }
}
