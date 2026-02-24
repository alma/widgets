import { parseJsonAttribute } from './parse-json-attribute'

/**
 * Helper for parsing JSON string attributes that can be provided either as:
 * - a JSON string
 * - null/undefined
 */
export function parseConfigAttribute<T>(value?: string | null): T | undefined {
  return parseJsonAttribute<T>(value ?? undefined)
}
