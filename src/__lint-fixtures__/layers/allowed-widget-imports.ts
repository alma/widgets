// path: src/widgets/payment-plans/fixture.ts
// expect: nothing
import * as planKind from '@/domain/plans/plan-kind'
import * as price from '@/shared/lib/price'
import * as common from '@/widgets/common/plan-strings.module.css'

export const modules = [common, planKind, price]
