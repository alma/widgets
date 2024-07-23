import { hashStringForStorage, isMoreThanOneHourAgo } from 'utils/utilsForStorage'

describe('utilsForStorage', () => {
  describe('hashStringForStorage', () => {
    it.each([
      ['test', '3556498'],
      ['hello.', 'A1220935268'], // a "A" is added to replace negative sign
      ['1123', '1508449'],
      ['', '0'],
    ])('should return a hash for %s string', (string: string, result: string) => {
      const hash = hashStringForStorage(string)
      expect(hash).toBe(result)
    })
  })
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
})
