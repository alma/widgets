module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-a11y'],
  rules: {
    'a11y/content-property-no-static-value': true,
    'a11y/font-size-is-readable': true,
    'a11y/media-prefers-reduced-motion': true,
    'a11y/no-display-none': true,
    'a11y/no-obsolete-attribute': true,
    'a11y/no-obsolete-element': true,
    'a11y/no-outline-none': true,
    'a11y/no-spread-text': true,
    'a11y/no-text-align-justify': true,
    'a11y/selector-pseudo-class-focus': true,
    'selector-class-pattern': null,
    // Keeps the widget easy to override. master's ID-scoped .sr-only rules are exempt.
    'selector-max-specificity': [
      '0,3,0',
      {
        ignoreSelectors: [
          '#alma-widget-payment-plans-main-container',
          '#alma-widget-modal-main-container',
        ],
      },
    ],
    // Bans bare type selectors such as `p`.
    'selector-max-type': [0, { ignore: ['descendant', 'child', 'compounded', 'next-sibling'] }],
    // Cascade layers and :where() change override order. The widget has no Shadow DOM.
    'at-rule-disallowed-list': ['layer'],
    'selector-pseudo-class-disallowed-list': ['where', 'host', 'host-context'],
    'selector-pseudo-element-disallowed-list': ['part', 'slotted'],
  },
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    'node_modules/**',
    'build/**',
    'dist/**',
    // The lint fixtures break the rules on purpose. npm run test:harness lints them.
    'src/__lint-fixtures__/**',
  ],
}
