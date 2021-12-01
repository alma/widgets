import cx from 'classnames'
import { IEligibility } from '@alma/client/dist/types/entities/eligibility'
import CrossIcon from '@/assets/Cross'

export const basePillClasses = [
  'atw-flex',
  'atw-p-1',
  'atw-text-white',
  'atw-rounded-sm',
  'atw-transition-colors',
  'atw-duration-500',
  'atw-select-none',
]

type PlanPillProps = {
  isActive: boolean
  eligibility: IEligibility
  mouseEnterCallback: () => void
}

export function PlanPill({
  isActive,
  eligibility,
  mouseEnterCallback,
}: PlanPillProps): JSX.Element {
  const isEligible = eligibility.eligible

  return (
    <span className={cx('atw-inline-block', 'atw-h-7')}>
      <span
        className={cx(
          'atw-inline-block',
          'atw-transition-all',
          'atw-duration-500',
          'atw-border-b-2',
          {
            'atw-border-red': isActive && isEligible,
            'atw-border-opacity-100': isActive && isEligible,
            'atw-border-blue': !isActive || !isEligible,
            'atw-border-opacity-50': isActive && !isEligible,
            'atw-border-opacity-0': !isActive,
          },
          isActive ? 'atw-h-7' : 'atw-h-6',
        )}
      >
        <span
          className={cx(...basePillClasses, {
            'atw-bg-red': isActive && isEligible,
            'atw-bg-blue': !isActive || !isEligible,
            'atw-bg-opacity-50': isActive && !isEligible,
            'atw-bg-opacity-25': !isActive && !isEligible,
          })}
          onMouseEnter={mouseEnterCallback}
        >
          {eligibility.installments_count}
          <CrossIcon className="plan-pill-multiplier" />
        </span>
      </span>
    </span>
  )
}
