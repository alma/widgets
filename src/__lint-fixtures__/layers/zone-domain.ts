// path: src/domain/plans/fixture.ts
// expect: import/no-restricted-paths "domain/ imports only shared/lib/ and shared/config/"
import * as cards from '@/shared/ui/icons/cards/cards.types'
import * as paymentPlans from '@/widgets/payment-plans/payment-plans.const'

export const modules = [cards, paymentPlans]
