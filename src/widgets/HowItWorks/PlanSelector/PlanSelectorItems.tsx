import cx from 'classnames'
import { integer } from '@/types'

type PlanSelectorProps = {
  n: integer
  selected: boolean
  onSelect: (n: integer) => void
}

const baseItemClasses = [
  'atw-group',
  'atw-inline-block',
  'atw-transition-all',
  'duration-200',
  'atw-border-b-3',
  'atw-text-sm',
]

const basePillClasses = [
  'atw-inline-block',
  'atw-p-1',
  'atw-text-white',
  'atw-rounded-sm',
  'atw-my-4',
  'atw-transition-colors',
  'atw-duration-200',
  ' atw-select-none',
]

export function PlanSelectorPlaceholder(): JSX.Element {
  const itemClasses = cx(
    ...baseItemClasses,
    '.atw-animate-pulse',
    'atw-border-orange-900',
    'atw-opacity-50',
    'atw-text-orange-900',
  )
  const pillClasses = cx(...basePillClasses, 'atw-bg-orange-900')

  return (
    <li className={itemClasses}>
      Payez en <span className={pillClasses}>⨉</span>
    </li>
  )
}

export function PlanSelectorItem({ n, selected, onSelect }: PlanSelectorProps): JSX.Element {
  const itemClasses = cx(
    ...baseItemClasses,
    selected ? 'atw-border-red' : 'atw-border-transparent',
    'atw-cursor-pointer',
  )

  const pillClasses = cx(...basePillClasses, selected ? 'atw-bg-red' : 'atw-bg-blue', {
    'group-hover:atw-bg-red': !selected,
  })

  function handleClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    onSelect(n)
  }

  return (
    <li className={itemClasses} onClick={handleClick}>
      Payez en <span className={pillClasses}>{n}⨉</span>
    </li>
  )
}
