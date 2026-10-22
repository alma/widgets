// path: src/domain/plans/api/fixture.ts
// expect: nothing
export const request = fetch('/v2/payments/eligibility')
export const cached = sessionStorage.getItem('eligibility')
