// path: src/widgets/payment-plans/fixture.ts
// expect: import/no-restricted-paths "and the modal only through widgets/eligibility-modal/index.ts"
import * as publicApi from '@/public-api/public-api.const'
import * as modal from '@/widgets/eligibility-modal/eligibility-modal.const'

export const modules = [modal, publicApi]
