---
paths:
  - "src/domain/**"
  - "src/shared/lib/http.ts"
---

# `src/domain/` and the eligibility request

These rules cover 4.x only and override generic Lit advice. `domain/` holds the business rules: plan kinds, regulatory figures, filter and sort, and the eligibility request and its cache in `api/`. `src/shared/lib/http.ts` sends that request.

Generic advice that doesn't apply here: wrapping the request in a Lit `Task` or a reactive controller. The request and the cache stay plain functions, and the controller that calls them lives in `widgets/common/`.

## Rules

- **ARCH-21** The eligibility request stays `POST /v2/payments/eligibility` with the headers `Authorization: Alma-Merchant-Auth <merchantId>` and `X-Alma-Agent: Alma Widget/<version>`, cached for one hour in `sessionStorage`. The JavaScript sends no other request. Why: the API expects this request, and merchants expect no tracking. Check: contract tests.
