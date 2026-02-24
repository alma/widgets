import type { EligibilityPlan } from '../../types'

// Re-export the shared deterministic fixture used across test suites.
// Keeping a single source of truth prevents subtle drift between fixtures.
export { ELIGIBILITY_FIXTURE } from './eligibility-fixture'
export { ELIGIBILITY_WITH_INELIGIBLE_FIXTURE } from './eligibility-ineligible-fixture'

// Keep this file for backward compatibility with existing imports.
export type { EligibilityPlan }
