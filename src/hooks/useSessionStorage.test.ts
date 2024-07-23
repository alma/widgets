import { renderHook, act } from '@testing-library/react-hooks'
import { mockButtonPlans } from 'test/fixtures'
import { useSessionStorage } from 'hooks/useSessionStorage'
describe('useSessionStorage', () => {
  let mockStorage: Record<string, string> = {}

  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key: string, value) => {
      mockStorage[key] = value
    })
    global.Storage.prototype.getItem = jest.fn((key) => {
      return mockStorage[key]
    })
    global.Storage.prototype.removeItem = jest.fn((key) => {
      delete mockStorage[key]
    })
    global.Storage.prototype.clear = jest.fn(() => {
      mockStorage = {}
    })
  })

  beforeEach(() => {
    // Start with a clean storage
    mockStorage = {}
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should call the dedicated sessionStorage functions', () => {
    const { result } = renderHook(() => useSessionStorage())

    // First we check that the storage is empty for a key
    expect(result.current.getCache('someKey')).toEqual(null)
    // We set values for the specific key
    act(() => result.current.setCache('someKey', mockButtonPlans))

    // We check that storage has been updated
    expect(result.current.getCache('someKey')).toStrictEqual({
      value: mockButtonPlans,
      // Date.now() is mocked to return 1638350762000 in setupTests.ts
      timestamp: 1638350762000,
    })

    // We set another value for the another key
    act(() => result.current.setCache('otherKey', [mockButtonPlans[0]]))

    // We delete someKey values
    act(() => result.current.deleteCache('someKey'))
    // We check that storage is empty again for this key
    expect(result.current.getCache('someKey')).toEqual(null)
    // But it's still filled for the other key
    expect(result.current.getCache('otherKey')).toStrictEqual({
      value: [mockButtonPlans[0]],
      // Date.now() is mocked to return 1638350762000 in setupTests.ts
      timestamp: 1638350762000,
    })

    // We clean the storage
    act(() => result.current.clearCache())
    // We check that storage is empty for the remaining key
    expect(result.current.getCache('otherKey')).toStrictEqual(null)
  })
})
