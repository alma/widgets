// path: src/domain/plans/fixture.test.ts
// expect: nothing
import * as publicApi from '@/public-api/public-api.const'

export const page = window.location.href
export const encoded = Buffer.from('3x').toString('base64')
export const modules = [publicApi]
