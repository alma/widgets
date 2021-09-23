import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'

function isFree(plan: IPaymentPlan): boolean {
  return plan.find((i) => i.customer_fee > 0 || i.customer_interest > 0) == null
}

export function PlanIntro({ plan }: { plan: IPaymentPlan | null }): JSX.Element {
  if (!plan) {
    return (
      <div className="atw-my-8 atw-space-y-2 atw-animate-pulse">
        <div className="atw-h-4 atw-bg-orange-900 atw-rounded-sm atw-opacity-15">&nbsp;</div>
        <div className="atw-h-4 atw-bg-orange-900 atw-rounded-sm atw-opacity-15">&nbsp;</div>
      </div>
    )
  }

  return (
    <p className="atw-my-8 atw-text-lg">
      Paiement {isFree(plan) ? 'sans frais,' : null} par carte bancaire, en {plan.length}{' '}
      échéances&nbsp;:
    </p>
  )
}
