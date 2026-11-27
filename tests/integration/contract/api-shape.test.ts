import { beforeAll, describe, expect, it } from 'vitest'

import { loadUmd } from './support/load-bundle'

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

// The unit tests cover the rest of the API. Only the built bundle shows what window.Alma holds.
describe('window.Alma', () => {
  it('has the keys Widgets, Utils and ApiMode in that order, and the Module tag', () => {
    expect(Object.keys(Alma)).toEqual(['Widgets', 'Utils', 'ApiMode'])
    expect(Object.prototype.toString.call(Alma)).toBe('[object Module]')
  })
})
