import cx from 'classnames'

import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types'
import { IEligibility } from '@alma/client/dist/types/entities/eligibility'

import almaLogo from '../../assets/alma.svg'

type RendererProps = {
  queriedPlans: QueriedPlanProperties[]
  results: IEligibility[]
}

const basePillClasses = [
  'atw-inline-block',
  'atw-p-1',
  'atw-text-white',
  'atw-rounded-sm',
  'atw-transition-colors',
  'atw-duration-200',
  'atw-select-none',
]

export function PaymentPlansRenderer({ queriedPlans, results }: RendererProps): JSX.Element | null {
  let planPills: JSX.Element[], planSummary: JSX.Element

  if (results.length === 0) {
    // We're still loading results, but we know what pills will be presented so show placeholders
    planPills = queriedPlans.map((p) => (
      <span className="atw-animate-pulse">
        <span
          className={cx(
            ...basePillClasses,
            'atw-bg-blue',
            'atw-opacity-25',
            'atw-w-full atw-h-full',
          )}
        >
          {p.installmentsCount}⨉
        </span>
      </span>
    ))

    planSummary = (
      <span className="atw-animate-pulse atw-flex-grow">
        <span className="atw-inline-block atw-h-4 atw-bg-blue atw-opacity-25 atw-rounded-sm atw-w-full">
          &nbsp;
        </span>
      </span>
    )
  } else {
    planPills = []
    planSummary = <span>&nbsp;</span>
  }

  return (
    <>
      <p className="atw-invisible atw-my-1 atw-pl-1 atw-text-xs atw-font-normal">
        cliquez pour plus d'infos
      </p>
      <div className="atw-bg-white atw-flex atw-flex-row atw-items-center atw-p-2 atw-space-x-2 atw-rounded-md atw-border atw-border-blue atw-border-opacity-50">
        <img className="atw-h-6" src={almaLogo} alt="Alma" />
        {planPills}
        {planSummary}
      </div>
    </>
  )
}
