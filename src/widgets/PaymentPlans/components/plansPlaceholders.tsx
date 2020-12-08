import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types'
import { PlanPillPlaceholder } from '@/widgets/PaymentPlans/components/PlanPillPlaceholder'

type PlansPlaceholderProps = {
  error: boolean
  queriedPlans: QueriedPlanProperties[]
  errorRetryCallback: () => void
}

export function plansPlaceholders({
  error,
  queriedPlans,
  errorRetryCallback,
}: PlansPlaceholderProps): { planPills: JSX.Element[]; planSummary: JSX.Element } {
  const planPills = queriedPlans.map((p, idx) => <PlanPillPlaceholder plan={p} key={idx} />)

  let planSummary
  if (error) {
    planSummary = (
      <span>
        <span className="atw-text-xs">ERREUR</span> &nbsp;
        <span className="atw-text-blue atw-underline" onClick={errorRetryCallback}>
          réessayer
        </span>
      </span>
    )
  } else {
    planSummary = (
      <span className="atw-animate-pulse">
        <span className="atw-inline-block atw-h-4 atw-bg-blue atw-opacity-25 atw-rounded-sm atw-w-full">
          &nbsp;
        </span>
      </span>
    )
  }

  return { planPills, planSummary }
}
