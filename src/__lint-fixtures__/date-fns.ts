// expect: no-restricted-imports "Use the date helpers in @/shared/lib/date"
import { addDays } from 'date-fns'
import format from 'date-fns/format'

export const helpers = [addDays, format]
