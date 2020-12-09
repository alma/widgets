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
