# Session Storage Hashing

This widget uses hashed sessionStorage keys to cache eligibility responses, matching the legacy widget behavior.

---

## Summary

- Cache keys are hashed to keep them short and consistent.
- Cached responses expire after **1 hour**.
- The cache is session‑scoped (cleared when the browser session ends).

---

## Key Files

- `src/utils/storage-hash.ts` — hash + TTL helpers
- `src/utils/fetch-eligibility.ts` — cache usage

---

## Behavior

- First call: fetches from API and caches the response.
- Subsequent calls (same parameters): returns cached data.
- Expired entries are removed and re-fetched.

---

## Notes

- Hashing keeps keys short even with long config payloads.
- Cache is safe to bypass by changing purchase amount or config.
