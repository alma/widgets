## [1.1.2](https://github.com/alma/alma-widgets/compare/v1.1.1...v1.1.2) (2021-11-19)


### Bug Fixes

* **widget:** add customer interest in first and next amount ([2a54db7](https://github.com/alma/alma-widgets/commit/2a54db7ee7a81449b482bbb57108374b8d46875b))

## [1.1.1](https://github.com/alma/alma-widgets/compare/v1.1.0...v1.1.1) (2021-10-13)


### Bug Fixes

* **eligibility:** change default minAmount rules ([504f623](https://github.com/alma/alma-widgets/commit/504f623f164ee1a8eeb4ced013143a927819119b))

# [1.1.0](https://github.com/alma/alma-widgets/compare/v1.0.2...v1.1.0) (2021-09-28)


### Bug Fixes

* **multiply-sign:** replace by a svg ([acb2581](https://github.com/alma/alma-widgets/commit/acb25812e1c8f484584b12ef72f7e592f41f4c3f))
* **p10x:** handle customer_interest ([0f6b97b](https://github.com/alma/alma-widgets/commit/0f6b97bf8dcf1d58013ac444773de47abdc0bd7c))
* **p10x:** use customer_interest in total amount calculation ([f39a0e1](https://github.com/alma/alma-widgets/commit/f39a0e168e237ef343b0015f726260d90903d811))


### Features

* **p10x:** add legal credit text ([89985a8](https://github.com/alma/alma-widgets/commit/89985a879c33c5882e7dbbf6e33ceac01915cf51))

## [1.0.2](https://github.com/alma/alma-widgets/compare/v1.0.1...v1.0.2) (2020-12-10)


### Bug Fixes

* add some more styles reset to protect widgets from host's CSS ([c2a560a](https://github.com/alma/alma-widgets/commit/c2a560acb97e11427e3a2224b92de6453bbfd445))
* change rem for px on all dimensions to avoid depending on host's CSS ([ddf486d](https://github.com/alma/alma-widgets/commit/ddf486d11a0e5d32cd8cfcc7fde918080b59caca))

## [1.0.1](https://github.com/alma/alma-widgets/compare/v1.0.0...v1.0.1) (2020-12-09)


### Bug Fixes

* **readme:** remove TypeScript starter lib's readme and re-release to NPM ([7952cc4](https://github.com/alma/alma-widgets/commit/7952cc422ecaecc9884197a4b51a639460f2572c))

# 1.0.0 (2020-12-09)


### Bug Fixes

* fix modal close callback not being bound to `this` ([f064300](https://github.com/alma/alma-widgets/commit/f0643007fab9e91a1e3a42d1498ae65c6ae69f1a))
* fix modal showing a vertical scrollbar because of card logos ([9f3b4c1](https://github.com/alma/alma-widgets/commit/9f3b4c127990d01900c200dda62a8652013620c0))
* **payment-plans:** make it clearer, which plan is active ([753b687](https://github.com/alma/alma-widgets/commit/753b68775fbab5eefd571a4af99c306d4dfaf1a2))
* improve display for smaller widths ([597ed44](https://github.com/alma/alma-widgets/commit/597ed44951238f29f5d4f71fd52c4a68874c3073))
* various fixes ([2ed56c5](https://github.com/alma/alma-widgets/commit/2ed56c527e2d87ef0057f8a83f52bc3909f8062a))


### Features

* **payment-plans:** allow deactivation of auto transition between plans ([2ddb1d0](https://github.com/alma/alma-widgets/commit/2ddb1d0e929063425a05ae4609a4260495558038))


* feat(payment-plans)!: display payment plans information in a compact way ([ce3d1eb](https://github.com/alma/alma-widgets/commit/ce3d1eb6425807a83c413546b31ded30c5b8dbf6))
* refactor!: make PaymentPlans widget follow new architecture for preact rendering ([5749be5](https://github.com/alma/alma-widgets/commit/5749be5b8d123417e493bdcb5c8de4b31bede020))
* feat!: complete overhaul of the "How It Works" widget ([6bef49a](https://github.com/alma/alma-widgets/commit/6bef49a05478edcbec8717bbe77804ecaa4c90b2))
* refactor!: make Widget render a preact-based renderer component ([ea771c2](https://github.com/alma/alma-widgets/commit/ea771c2f3f91c9a910935045664802c04f16abfa))


### BREAKING CHANGES

* new design for the widget means its external API & settings
have changed completely.
* because of its new design, the widget now accepts less settings
and is prepared for more complex use cases to come such as PayLater support
* - The widget imposes its design/layout and, to maintain
  Alma's branding, is not customizable anymore.
- Settings have been reduced to the bare necessary.
- The widget now only generates a modal (used to render a clickable
  title that triggered the modal); it must be controlled by the
  implementer using its `show` property.
* Heavy refactoring introduces multiple breaking changes:
- `WidgetsController.create` renamed to `add`
- Widget class internal methods have change; `refresh` is removed and
  `render` made the main rendering entrypoint
- Widget subclasses must now implement a `renderComponent` method to
  implement their rendering
