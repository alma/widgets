import 'vitest'

// vitest-axe declares its matcher on the Vi namespace of old Vitest versions, which Vitest 5 no
// longer reads.
declare module 'vitest' {
  // Declaration merging needs the type parameters of Vitest's own declaration, T included.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toHaveNoViolations: () => R
  }
}
