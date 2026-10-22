// path: src/domain/plans/fixture.test.ts
// expect: no-restricted-imports "domain/ is plain TypeScript. Lit code goes in widgets/ or shared/ui/."
import { html } from 'lit'

export const template = html`<p>3x</p>`
