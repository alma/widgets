// path: src/widgets/common/fixture.ts
// expect: no-restricted-globals "Only domain/plans/api/ and shared/lib/http.ts use fetch and sessionStorage."
// expect: no-restricted-properties "Only domain/plans/api/ and shared/lib/http.ts use fetch and sessionStorage."
export const request = fetch('/v2/payments/eligibility')
export const cached = window.sessionStorage.getItem('eligibility')
