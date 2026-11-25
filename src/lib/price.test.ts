import { formatCents, priceFromCents, priceToCents } from '@/lib/price'

describe('price', () => {
  it('transform euros in cents', () => {
    expect(priceToCents(100)).toBe(10000)
    expect(priceToCents(200)).toBe(20000)
    expect(priceToCents(1.0)).toBe(100)
    expect(priceToCents(9.99)).toBe(999)
  })

  it('transform cents into euros', () => {
    expect(priceFromCents(12345)).toBe(123.45)
    expect(priceFromCents(12300)).toBe(123)
    expect(priceFromCents(5)).toBe(0.05)
  })

  it('transform cents values into a properly displayed text', () => {
    expect(formatCents(10000)).toBe('100')
    expect(formatCents(100.0)).toBe('1')
    expect(formatCents(100.9)).toBe('1,01')
  })
})
