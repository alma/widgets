// path: src/shared/lib/fixture.ts
// expect: no-restricted-imports "Use the @/ alias instead of a relative import."
import * as price from './price'

export const helpers = price
