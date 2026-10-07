import { isMoreThanOneHourAgo } from '@/domain/plans/api/eligibility-cache'

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
})
