import { expect } from '@open-wc/testing'
import { parseJsonAttribute } from '../utils/parse-json-attribute'
import { getWidgetConfig } from '../utils/widget-config'

/**
 * Unit tests for utility functions
 * Tests data parsing and configuration access
 */
describe('Utility Functions', () => {
  describe('parseJsonAttribute', () => {
    it('should parse valid JSON strings', () => {
      const input = JSON.stringify(['visa', 'mastercard'])
      const result = parseJsonAttribute<string[]>(input)
      expect(result).to.deep.equal(['visa', 'mastercard'])
    })

    it('should return undefined for undefined input', () => {
      const result = parseJsonAttribute(undefined)
      expect(result).to.be.undefined
    })

    it('should return undefined for empty string', () => {
      const result = parseJsonAttribute('')
      expect(result).to.be.undefined
    })

    it('should return undefined for invalid JSON', () => {
      const result = parseJsonAttribute('{ invalid json }')
      expect(result).to.be.undefined
    })

    it('should parse complex objects', () => {
      interface Plan {
        installmentsCount: number
        minAmount: number
        maxAmount: number
      }

      const input = JSON.stringify([
        {
          installmentsCount: 3,
          minAmount: 10000,
          maxAmount: 200000,
        },
      ])
      const result = parseJsonAttribute<Plan[]>(input)
      expect(result).to.be.an('array')
      expect(result?.[0].installmentsCount).to.equal(3)
    })

    it('should type-preserve numeric values', () => {
      interface TestObject {
        count: number
        amount: number
      }

      const input = JSON.stringify({ count: 3, amount: 45000.5 })
      const result = parseJsonAttribute<TestObject>(input)
      expect(result?.count).to.equal(3)
      expect(result?.amount).to.equal(45000.5)
    })
  })

  describe('getWidgetConfig', () => {
    beforeEach(() => {
      ;(window as any).__ALMA_WIDGET_CONFIG__ = {
        merchantId: 'test_merchant_123',
        apiMode: 'https://api.sandbox.getalma.eu',
      }
    })

    afterEach(() => {
      delete (window as any).__ALMA_WIDGET_CONFIG__
    })

    it('should retrieve merchant config from window', () => {
      const config = getWidgetConfig()
      expect(config).to.exist
      expect(config?.merchantId).to.equal('test_merchant_123')
      expect(config?.apiMode).to.equal('https://api.sandbox.getalma.eu')
    })

    it('should return undefined if config is not set', () => {
      delete (window as any).__ALMA_WIDGET_CONFIG__
      const config = getWidgetConfig()
      expect(config).to.be.undefined
    })

    it('should handle partial config gracefully', () => {
      ;(window as any).__ALMA_WIDGET_CONFIG__ = { merchantId: 'test_123' }
      const config = getWidgetConfig()
      expect(config?.merchantId).to.equal('test_123')
      expect(config?.apiMode).to.be.undefined
    })
  })
})
