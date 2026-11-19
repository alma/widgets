import type { ClassInfo } from 'lit/directives/class-map.js'

// classMap takes one class per key, and master's className prop can hold several.
export const withClassName = (baseClass: string, className = ''): ClassInfo => ({
  [baseClass]: true,
  ...Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => [token, true]),
  ),
})
