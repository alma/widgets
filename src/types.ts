// For semantic purposes
import { AnyArray, Builtin } from 'ts-essentials'

export type integer = number

export { DeepRequired } from 'ts-essentials'

export type DOMContent = string | HTMLElement | HTMLElement[]

export interface IObject {
  [key: string]: unknown
}

export type IsObject<T> = T extends AnyArray
  ? false
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object
  ? true
  : false

/*
  This type can be used as a "recursion stopper" in recursive helper types.
  It's useful to prevent "mangling" types with DeepRequired<T> or Deep*, that would recurse into any
  type used within `T`.

  Here's how to use it:

  ```
  interface Test {
    prop1?: string,
    prop2?: {
      prop3?: Preserve<SomeTypeToPreserve>
    },
    prop4: number
  }
  ```

  Using a "Preserve-aware" recursive type allows casting `Preserve<SomeTypeToPreserve>` back to
  `SomeTypeToPreserve` instead of recursing over all its properties.
  i.e. `DeepRequired<Test>` gives:

  ```
  interface Test {
    ...
    prop2: {
      prop3: DeepRequired<SomeTypeToPreserve>  // <- "mangles" SomeTypeToPreserve
    }
    ...
  }
  ```

  ... while `PreservedDeepRequired` gives:

  ```
  interface Test {
    ...
    prop2: {
      prop3: SomeTypeToPreserve
    }
    ...
  }
  ```
 */
export type Preserve<T> = T & { readonly __preserve__: 'preserve' }

/*
  Transforms `T` into an identical shape, but with all `Preserve<P>` types mapped back to `P`:

  ```
    ResolvePreserve<Preserve<T>> == T
  ```

  It can be useful to make an interface more dev-friendly. Consider this:

  ```
  interface Test {
    className?: string
    container?: Preserve<HTMLElement>
  }
  ```

  Because `container` uses `Preserve<HTMLElement>`, its type is actually:

  ```
  HTMLElement & { readonly __preserve__: 'preserve' }
  ```

  Since this is not assignable to `HTMLElement`, using `Test` directly requires using an explicit
  casting for all its "preserved" properties, which is cumbersome:

  ```
  declare const test: Test
  const container: HTMLElement = test.container as HTMLElement
  ```

  Using `ResolvePreserve`
 */
export type ResolvePreserve<T> = NonNullable<T> extends Preserve<infer P>
  ? P
  : {
      [K in keyof T]: NonNullable<T[K]> extends Builtin
        ? T[K]
        : NonNullable<T[K]> extends AnyArray
        ? T[K]
        : IsObject<NonNullable<T[K]>> extends true
        ? ResolvePreserve<T[K]>
        : T[K]
    }

// Just like DeepRequired, but will not recurse into `Preserve<P>` types: will map them back to `P`
export type PreservedDeepRequired<T> = NonNullable<T> extends Preserve<infer P>
  ? P
  : {
      [K in keyof T]-?: NonNullable<T[K]> extends Builtin
        ? T[K]
        : NonNullable<T[K]> extends AnyArray
        ? T[K]
        : IsObject<NonNullable<T[K]>> extends true
        ? PreservedDeepRequired<T[K]>
        : T[K]
    }
