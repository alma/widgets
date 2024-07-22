import { hashStringForStorage } from 'utils/utilsForStorage'

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
})
