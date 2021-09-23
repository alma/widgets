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

  return <ul className="atw-flex atw-justify-center">{installments}</ul>
}
