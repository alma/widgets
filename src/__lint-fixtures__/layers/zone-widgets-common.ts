// path: src/widgets/common/fixture.ts
// expect: import/no-restricted-paths "widgets/common/ imports only domain/ and shared/"
import * as paymentPlans from '@/widgets/payment-plans/payment-plans.const'

export const constants = paymentPlans
