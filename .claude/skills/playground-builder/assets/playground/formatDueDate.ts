import { format, fromUnixTime } from 'date-fns'

// due_date fields on a mocked plan's payment_plan entries are Unix seconds (see planBuilders.ts) —
// same unit fromUnixTime expects. Fully generic — used by PlanDraftCard.ts's due-dates chip row
// regardless of feature.
export const formatDueDate = (dueDateSeconds: number): string =>
  format(fromUnixTime(dueDateSeconds), 'd MMM yyyy')
