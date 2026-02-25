# Deployment Guide (Lit Widget)

This document explains how to build and publish the Lit widget as a standalone package, fully independent from the legacy Preact widget.

---

## 1) Package Independence

The Lit widget is a separate package in `widgets-lit/` and does not depend on `@alma/widgets`.

Checklist:
- `widgets-lit/package.json` has its own name, version, scripts, and dependencies.
- `widgets-lit/src/index.ts` is the only build entry.
- Build outputs are isolated in `widgets-lit/dist/`.

---

## 2) Build Outputs

The build produces two artifacts:

- `dist/alma-widgets.umd.js` (UMD, CDN/script tag usage)
- `dist/alma-widgets.js` (ES module)

Both bundles embed CSS and are self-contained.

---

## 3) Local Build Steps

```bash
cd widgets-lit
npm install
npm run build
```

Artifacts are generated in `widgets-lit/dist/`.

---

## 4) Publish to NPM (Standalone)

### 4.1 Update package metadata

In `widgets-lit/package.json`:
- `name`: `@alma/widgets-lit`
- `version`: bump according to SemVer
- `files`: ensure only `dist` is published

Optional (recommended): add `publishConfig` for public scope:

```json
"publishConfig": { "access": "public" }
```

### 4.2 Publish

```bash
cd widgets-lit
npm run build
npm publish
```

---

## 5) CDN Layout

Use a dedicated CDN path for Lit, separate from the legacy widget. Example:

```
https://cdn.almapay.com/widgets-lit/alma-widgets.umd.js
https://cdn.almapay.com/widgets-lit/alma-widgets.js
```

Recommended versioned structure:

```
https://cdn.almapay.com/widgets-lit/1.0.0/alma-widgets.umd.js
https://cdn.almapay.com/widgets-lit/1.0.0/alma-widgets.js
```

Optional convenience alias:

```
https://cdn.almapay.com/widgets-lit/latest/alma-widgets.umd.js
```

---

## 6) Release Flow (Suggested)

1. **Bump version** in `widgets-lit/package.json`.
2. **Build** with `npm run build`.
3. **Publish to npm** with `npm publish`.
4. **Upload CDN artifacts** from `widgets-lit/dist/` to the Lit CDN path.
5. **Invalidate CDN cache** if required.

---

## 7) Consumer Integration

### UMD (script tag)

```html
<script src="https://cdn.almapay.com/widgets-lit/alma-widgets.umd.js"></script>
<script>
  const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
  widgets.add(Alma.Widgets.PaymentPlans, {
    container: '#alma-widget',
    purchaseAmount: 45000,
    locale: 'fr',
  })
</script>
```

### ESM

```js
import Alma from 'https://cdn.almapay.com/widgets-lit/alma-widgets.js'

const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  locale: 'fr',
})
```

---

## 8) Optional CI/CD Notes

If you later add CI:

- Build in `widgets-lit/` only.
- Publish to npm (optional).
- Upload CDN artifacts from `widgets-lit/dist/`.
- Keep Lit and Preact release pipelines fully independent.

---

## 9) Troubleshooting

- **Bundle missing CSS:** make sure `cssCodeSplit: false` remains enabled in `widgets-lit/vite.config.ts`.
- **Global API missing:** verify `window.Alma` is exported in `widgets-lit/src/index.ts`.
- **CDN cache issues:** confirm versioned paths are used and cache invalidation is configured.

