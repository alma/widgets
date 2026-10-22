// path: src/domain/plans/fixture.ts
// expect: no-restricted-syntax "No CustomEvent"
// expect: no-restricted-imports "The bundle has no React"
import { useState } from 'react'

export const hook = useState
export const event = new CustomEvent('alma-close')
