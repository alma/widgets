import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types'
import cx from 'classnames'
import { basePillClasses } from './PlanPill'

export function PlanPillPlaceholder({ plan }: { plan: QueriedPlanProperties }): JSX.Element {
  return (
    <span className="atw-animate-pulse atw-h-7">
      <span
        className={cx(...basePillClasses, 'atw-bg-blue', 'atw-opacity-25', 'atw-w-full atw-h-6')}
      >
        {plan.installmentsCount}⨉
      </span>
    </span>
  )
}
