<!-- Title: a changelog-ready Conventional Commits subject. Delete what doesn't apply. -->

> <!-- Why this PR exists, what changes for merchants and shoppers, and what it doesn't include. -->

Fixes <!-- MP-123 -->

## Changes

<!-- One bullet per change, as a reviewer sees it, not one per file. -->

-

## To check

<!-- Each decision you want a reviewer to confirm, as a question. -->

- [ ]

## Left out

<!-- Known limits, and what a later PR will do. -->

## How to test

```bash
npm run test:no-coverage -- <test files>
```

<!-- The Storybook stories to open, with Merchant CSS off and on, and what you should see. -->

## Lit port

<!-- Port PRs only: copy these from pr-description.local.md. -->

- Contract surface:
- Expected failures removed:
- Dropped test cases:

<!-- lit-review:start -->
<details>
<summary>PR checklist</summary>

- [ ] The port reproduces master at the reference commit, quirks included. (ARCH-01)
- [ ] Each file sits in its layer and folder, and its suffix says what it holds. (LAYER-04, LAYER-11)
- [ ] Each timer, listener, observer, `matchMedia` query and animation frame stops on disconnect and starts again on reconnect. (ARCH-12)
- [ ] Each exported template has a story for each state and variant that master renders. (ARCH-11)
- [ ] No option, event, attribute, tag or element property is added, removed or renamed, the DOM matches master, and no exception reaches the page. (ARCH-08, ARCH-10, ARCH-13, ARCH-16 to ARCH-20)
- [ ] Messages reuse the descriptors of the `*.messages.ts` files. (ARCH-04)
- [ ] The contract classes, IDs, `data-testid` values and custom properties keep their names and their elements, and templates bind classes with `classMap` and add no inline style. (STYLE-01, STYLE-04, STYLE-05, STYLE-09)
- [ ] `main.css` and the `*.module.css` files keep master's content and order. (STYLE-02, STYLE-03)
- [ ] No change under `tests/integration/contract/`, apart from removing the expected failures that this PR makes pass. (CONTRACT)
- [ ] Roles, names, ARIA states, keyboard handling and focus match master. (A11Y-01, A11Y-06)
- [ ] The modal keeps react-modal's markup, with no `<dialog>`, no `inert` and no `aria-hidden` on the page behind it, and no DOM change made for axe. (A11Y-02, A11Y-03, A11Y-04, A11Y-05)
- [ ] Each story was checked in Storybook with Merchant CSS off and on, and with the Accessibility panel.
- [ ] `/lit-review` ran, and each finding is fixed or rejected with a reason.

</details>
<!-- lit-review:end -->
