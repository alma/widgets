import cx from 'classnames'
import { integer } from '@/types'
import { PlanSelectorItem, PlanSelectorPlaceholder } from './PlanSelectorItems'

type PlansSelectorsProps = {
  installmentsCounts: integer[]
  selectedPlan: integer
  onSelect: (n: integer) => void
}

export function PlanSelector({
  selectedPlan,
  installmentsCounts,
  onSelect,
}: PlansSelectorsProps): JSX.Element {
  const loading = installmentsCounts.length === 0

  let installments = null
  if (loading) {
    installments = <PlanSelectorPlaceholder />
  } else {
    installments = installmentsCounts.map((n) => (
      <PlanSelectorItem key={n} selected={n === selectedPlan} n={n} onSelect={onSelect} />
    ))
  }

  const classes = cx(
    'atw-flex',
    'atw-flex-row',
    'atw-justify-around',
    'atw-border',
    'atw-rounded-sm',
    loading
      ? ['atw-animate-pulse', 'atw-border-orange-900', 'atw-opacity-25']
      : 'atw-border-gray-400',
  )

  return <ul className={classes}>{installments}</ul>
}
