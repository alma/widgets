// path: src/domain/plans/fixture.types.ts
// expect: no-restricted-syntax "No CustomEvent"
// expect: no-restricted-syntax "A .types.ts file holds types only"
// expect: no-restricted-imports "The bundle has no React"
import type { ReactNode } from 'react'

export type Node = ReactNode
export const event = new CustomEvent('alma-close')
