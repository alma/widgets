// path: src/shared/lib/fixture.ts
// expect: no-restricted-globals "Only src/shared/config/ reads it."
export const version = process.env.BUILD_VERSION
