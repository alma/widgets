import {
  clearCache,
  createKey,
  deleteCache,
  getCache,
  isMoreThanOneHourAgo,
  setCache,
} from '@/domain/plans/api/eligibility-cache'
import type { EligibilityInput } from '@/domain/plans/api/eligibility.types'
import { mockButtonPlans } from '@/test/fixtures'

// The contract tests' build version, so the keys match theirs.
vi.mock('@/shared/config/build-version.const', () => ({ BUILD_VERSION: 'contract-test' }))

const SANDBOX = 'https://api.sandbox.getalma.eu'

describe('isMoreThanOneHourAgo', () => {
  it('should return true if the timestamp is more than one hour ago', () => {
    const date = Date.now() - 1000 * 60 * 60 - 1
    const result = isMoreThanOneHourAgo(date)
    expect(result).toBe(true)
  })
  it('should return false if the timestamp is less than one hour ago', () => {
    const date = Date.now() - 1000
    const result = isMoreThanOneHourAgo(date)
    expect(result).toBe(false)
  })
  it('should return true for a timestamp exactly one hour ago', () => {
    expect(isMoreThanOneHourAgo(Date.now() - 3600000)).toBe(true)
    expect(isMoreThanOneHourAgo(Date.now() - 3599999)).toBe(false)
  })
})

describe('createKey', () => {
  const input = (overrides: Partial<EligibilityInput> = {}): EligibilityInput => ({
    domain: SANDBOX,
    merchantId: 'm',
    purchaseAmount: 45000,
    ...overrides,
  })

  it('gives master hash for an amount and no other option', () => {
    expect(createKey(input())).toBe('A969556424')
  })

  it('changes with each option', () => {
    const keys = [
      createKey(input()),
      createKey(input({ purchaseAmount: 45001 })),
      createKey(input({ merchantId: 'n' })),
      createKey(input({ domain: 'https://api.getalma.eu' })),
      createKey(input({ configPlans: [] })),
      createKey(input({ configPlans: null })),
      createKey(input({ customerBillingCountry: 'FR' })),
      createKey(input({ customerShippingCountry: 'FR' })),
      createKey(input({ merchantCoversAllFees: false })),
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('keeps the key order of the plans as given', () => {
    const minFirst = [{ minAmount: 100, installmentsCount: 3, maxAmount: 200000 }]
    const countFirst = [{ installmentsCount: 3, minAmount: 100, maxAmount: 200000 }]
    expect(createKey(input({ configPlans: minFirst }))).not.toBe(
      createKey(input({ configPlans: countFirst })),
    )
  })
})

describe('the cache functions', () => {
  it('should call the dedicated sessionStorage functions', () => {
    expect(getCache('someKey')).toEqual(null)
    setCache('someKey', mockButtonPlans)

    // Date.now() is fixed by src/test/setup.ts.
    expect(getCache('someKey')).toStrictEqual({
      value: mockButtonPlans,
      timestamp: 1638350762000,
    })

    setCache('otherKey', [mockButtonPlans[0]])

    deleteCache('someKey')
    expect(getCache('someKey')).toEqual(null)
    expect(getCache('otherKey')).toStrictEqual({
      value: [mockButtonPlans[0]],
      timestamp: 1638350762000,
    })

    clearCache()
    expect(getCache('otherKey')).toEqual(null)
  })

  it('stores the value and the write time as master does', () => {
    setCache('key', [])
    expect(sessionStorage.getItem('key')).toBe('{"value":[],"timestamp":1638350762000}')
  })

  it('clears the keys that the widget did not write', () => {
    sessionStorage.setItem('merchant-cart', 'keep me')
    clearCache()
    expect(sessionStorage.length).toBe(0)
  })

  it('throws for an entry that is not JSON', () => {
    sessionStorage.setItem('key', '{not json')
    expect(() => getCache('key')).toThrow(SyntaxError)
  })

  it('lets each sessionStorage error through', () => {
    const error = new DOMException('The operation is insecure.', 'SecurityError')
    const fail = () => {
      throw error
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(fail)

    expect(() => getCache('key')).toThrow(error)
    expect(() => setCache('key', [])).toThrow(error)
    expect(() => deleteCache('key')).toThrow(error)
    expect(() => clearCache()).toThrow(error)
  })

  it('lets the error of a sessionStorage getter through', () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
    })
    try {
      expect(() => getCache('key')).toThrow(DOMException)
    } finally {
      Object.defineProperty(window, 'sessionStorage', descriptor as PropertyDescriptor)
    }
  })
})
