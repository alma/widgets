// path: src/domain/plans/fixture.ts
// expect: no-restricted-imports "domain/ is plain TypeScript. Lit code goes in widgets/ or shared/ui/."
import { Task } from '@lit/task'
import { html } from 'lit'

export const parts = [html, Task]
