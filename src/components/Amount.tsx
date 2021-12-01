import { integer } from '@/types'
import { formatCents } from '@/utils'

type AmountProps = {
  className?: string
  cents: integer
  currency?: string
}

export function Amount({ className, cents, currency = '€' }: AmountProps): JSX.Element {
  // &#8239; => NARROW NO-BREAK SPACE
  return (
    <span className={className}>
      {formatCents(cents)}&#8239;{currency}
    </span>
  )
}
