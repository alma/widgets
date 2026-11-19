// Stories run without Vitest, so no Vitest import.
import { TODAY } from '@/test/fixtures/plan-builders'

// Defaults to master's "today", which the due dates of the fixtures count from. Returns the undo
// function.
export const stubDateNow = (now = TODAY): (() => void) => {
  const previousNow = Date.now
  Date.now = () => now
  return () => {
    Date.now = previousNow
  }
}
