<!-- Title: a changelog-ready Conventional Commits subject. Delete what doesn't apply. -->

> <!-- Why this PR exists, what changes for merchants and shoppers, and what it doesn't include. -->

Fixes <!-- the issue link, when there is one -->

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

## Merchant contract

<!-- When this PR adds, removes or changes a part of the merchant contract: list each function,
option, default, callback, return value, published file or tag name, and say whether it is added,
removed or changed. A change to the DOM, a class or an ID doesn't go here. -->

-

<!-- lit-review:start -->
<details>
<summary>PR checklist</summary>

- [ ] Each file sits in its layer and folder, and its suffix says what it holds. (LAYER-04, LAYER-11)
- [ ] Each timer, listener, observer, `matchMedia` query and animation frame stops on disconnect and starts again on reconnect. (ARCH-12)
- [ ] An element or a template has stories only when it renders two or more variants, one per variant, and no story repeats a variant of a lower template. (ARCH-24)
- [ ] No element property is removed, renamed or retyped, nothing in the merchant contract is removed or renamed, an added option, callback, event member or tag is optional with a default that keeps the current behaviour, merchants get no hook other than the options, and no exception reaches the page. (ARCH-08, ARCH-10, ARCH-13, ARCH-16 to ARCH-20, ARCH-25)
- [ ] Messages reuse the descriptors of the `*.messages.ts` files. (ARCH-04)
- [ ] The CSS applies inside the shadow roots only, each custom property is an `--alma-*` declared inside the root, and templates add no inline style. (STYLE-01, STYLE-05, STYLE-10)
- [ ] The CSS still in light DOM keeps `main.css` as the first import, and its templates bind classes with `classMap`. (STYLE-03, STYLE-04)
- [ ] No change under `tests/integration/contract/`, apart from removing the expected failures that this PR makes pass. (CONTRACT)
- [ ] Roles, names, ARIA states, keyboard handling and focus are at least as good as at the merge base. (A11Y-01, A11Y-06)
- [ ] Axe violations are fixed in the markup, and an axe rule is turned off only for a wrong report, with a comment that says why. (A11Y-02)
- [ ] Each story was checked in Storybook with Merchant CSS off and on, and with the Accessibility panel.
- [ ] `/lit-review` ran, and each finding is fixed or rejected with a reason.

</details>
<!-- lit-review:end -->
