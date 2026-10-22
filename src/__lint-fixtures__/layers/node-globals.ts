// path: src/widgets/common/fixture.ts
// expect: no-restricted-globals "The widget runs in a browser, where this Node global does not exist."
export const encoded = Buffer.from('3x').toString('base64')
