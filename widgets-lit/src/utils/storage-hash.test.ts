import { expect } from '@open-wc/testing'
import { hashStringForStorage, isMoreThanOneHourAgo } from '../utils/storage-hash'

/**
 * Unit tests for storage hashing utilities
 */
describe('Storage Hash Utilities', () => {
  describe('hashStringForStorage', () => {
    it('should hash a string to a numeric string', () => {
      const input = 'test_cache_key'
      const result = hashStringForStorage(input)

      expect(result).to.be.a('string')
      expect(result).to.match(/^[0-9A-Za-z-]*$/) // Only alphanumeric or A (replacing -)
    })

    it('should produce consistent hashes for the same input', () => {
      const input = 'merchant_123_45000_plans_config'
      const hash1 = hashStringForStorage(input)
      const hash2 = hashStringForStorage(input)

      expect(hash1).to.equal(hash2)
    })

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashStringForStorage('input1')
      const hash2 = hashStringForStorage('input2')

      expect(hash1).to.not.equal(hash2)
    })

    it('should handle empty strings', () => {
      const result = hashStringForStorage('')

      expect(result).to.equal('0')
    })

    it('should replace negative hashes with A prefix', () => {
      // Some input strings may produce negative hashes
      // The function converts them to string and replaces '-' with 'A'
      const result = hashStringForStorage('test')

      expect(result).to.not.include('-')
    })

    it('should produce short keys for long parameter combinations', () => {
      const longKey = `merchant_123_45000_${JSON.stringify([{ installmentsCount: 3 }, { installmentsCount: 4 }])}_FR_FR_true`
      const hash = hashStringForStorage(longKey)

      // Hash should be reasonably short (much shorter than the input)
      expect(hash.length).to.be.lessThan(longKey.length)
      expect(hash.length).to.be.greaterThan(0)
    })
  })

  describe('isMoreThanOneHourAgo', () => {
    it('should return false for recent timestamps', () => {
      const recentTime = Date.now() - 30 * 60 * 1000 // 30 minutes ago

      expect(isMoreThanOneHourAgo(recentTime)).to.be.false
    })

    it('should return true for old timestamps', () => {
      const oldTime = Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago

      expect(isMoreThanOneHourAgo(oldTime)).to.be.true
    })

    it('should return false for current timestamp', () => {
      const now = Date.now()

      expect(isMoreThanOneHourAgo(now)).to.be.false
    })

    it('should return true exactly at 1 hour boundary', () => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000

      expect(isMoreThanOneHourAgo(oneHourAgo)).to.be.true
    })

    it('should return false just before 1 hour', () => {
      const almostOneHour = Date.now() - 60 * 60 * 1000 + 100 // 1 hour minus 100ms

      expect(isMoreThanOneHourAgo(almostOneHour)).to.be.false
    })
  })
})
