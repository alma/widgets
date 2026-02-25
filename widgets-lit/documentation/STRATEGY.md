# Lit Widget Strategy (POC to Official)

This document explains the rationale and rollout strategy for the Lit widget.

---

## Why Lit Exists (POC Origins)

The Lit widget started as a proof of concept to re-implement the Alma widget without framework dependencies.

Goals:
- Remove the dependency on Preact/React runtime.
- Improve compatibility with merchant stacks (for example, React 19 integrations).
- Keep a single, lightweight script that works everywhere.

The intent is to provide a stable, framework-agnostic widget that is easier to integrate across diverse merchant environments.

---

## Naming Strategy (Avoid “widgets” Confusion)

To avoid naming collisions with the legacy package, the Lit widget should ship under a distinct name.

Candidate names:
- **widgets-light**
- **widgets-alma**
- **alma-widgets-lite**
- **alma-widgets-next**
- **alma-widgets-web**

The final name should clearly signal:
- It is the new standalone widget.
- It is not the legacy Preact package.

---

## Release Strategy (Beta First)

The initial plan is to release the Lit widget as a **beta** package:

- Publish the Lit widget under a distinct name (see above).
- Host it on a dedicated CDN path (separate from the legacy widget).
- Provide it **case-by-case** for merchants who cannot use the legacy widget
  (for example, integrations that break with Preact but work with Lit).

---

## Migration Path (Gradual Replacement)

The long-term strategy is to iteratively replace the Preact widget with Lit:

1. **Beta distribution** for select merchants (custom integrations).
2. **Iterate and stabilize** based on real-world feedback.
3. **Integrate in CMS plugins** (Shopify / WooCommerce / etc.) when ready.
4. **Monitor & improve** performance, a11y, and parity.
5. **Public documentation updates** to recommend Lit for new integrations.
6. **Deprecate Preact** for custom integrations.
7. **Freeze legacy widget** (maintenance/security only).

Eventually, the Lit widget becomes the official, actively evolving widget, while the Preact widget is no longer enhanced.

---

## Communication Notes

When the Lit widget is ready for broader adoption:

- Update public docs to position Lit as the recommended integration.
- Announce the legacy widget deprecation timeline.
- Provide clear migration guides and compatibility notes.

---

## Out of Scope (POC)

- Full production release pipeline (CI/CD).
- Automated Crowdin integration.
- Official “latest” CDN alias.

These are expected to be added as part of the production rollout.

