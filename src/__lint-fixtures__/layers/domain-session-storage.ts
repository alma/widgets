// path: src/domain/plans/fixture.ts
// expect: no-restricted-globals "Only domain/plans/api/ and shared/lib/http.ts use fetch and sessionStorage."
export const cached = sessionStorage.getItem('eligibility')
