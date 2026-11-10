// The only modal file that another widget may import (LAYER-02). It also registers
// <alma-eligibility-modal>, which the facade creates by its tag.
import '@/widgets/eligibility-modal/eligibility-modal.element'

export { closeModalOf } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
export {
  PlansModalController,
  type PlansModalParams,
} from '@/widgets/eligibility-modal/controllers/plans-modal.controller'
