// path: src/public-api/fixture.ts
// expect: nothing
import * as planKind from '@/domain/plans/plan-kind'
import * as price from '@/shared/lib/price'
import * as paymentPlans from '@/widgets/payment-plans/payment-plans.const'

export const modules = [paymentPlans, planKind, price]
