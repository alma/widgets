// path: src/domain/plans/fixture.ts
// expect: no-restricted-globals "domain/ is plain TypeScript with no DOM"
export const page = [window.location.href, document.title]
