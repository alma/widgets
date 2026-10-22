// path: src/shared/lib/fixture.ts
// expect: import/no-restricted-paths "shared/ imports nothing else from src/"
import * as planKind from '@/domain/plans/plan-kind'

export const kinds = planKind
