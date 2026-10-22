// path: src/public-api/fixture.ts
// expect: import/no-restricted-paths "public-api/ imports only widgets/, domain/ and shared/"
import * as testFixtures from '@/test/fixtures'

export const fixtures = testFixtures
