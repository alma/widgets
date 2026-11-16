// Lint bans only what protects merchants and shoppers. Review covers the other rules of
// .claude/rules/.

// Import layers of src/: each folder, the other folders it may import, and the message.
const LAYERS = [
  [
    'shared',
    ['intl'],
    'shared/ imports nothing else from src/, apart from the catalogues in src/intl/.',
  ],
  [
    'domain',
    ['shared/lib', 'shared/config'],
    'domain/ imports only shared/lib/ and shared/config/.',
  ],
  ['widgets/common', ['domain', 'shared'], 'widgets/common/ imports only domain/ and shared/.'],
  [
    'widgets/payment-plans',
    ['widgets/common', 'widgets/eligibility-modal/index.ts', 'domain', 'shared'],
    'widgets/payment-plans/ imports widgets/common/, domain/ and shared/, and the modal only through widgets/eligibility-modal/index.ts.',
  ],
  [
    'widgets/eligibility-modal',
    ['widgets/common', 'domain', 'shared'],
    'widgets/eligibility-modal/ imports only widgets/common/, domain/ and shared/.',
  ],
  [
    'public-api',
    ['widgets', 'domain', 'shared'],
    'public-api/ imports only widgets/, domain/ and shared/.',
  ],
]

// No entry allows public-api/, src/index.ts or src/test/, so no layer can import them.
const LAYER_ZONES = LAYERS.map(([folder, allowed, message]) => ({
  target: `./src/${folder}`,
  from: './src',
  except: [folder, ...allowed].map((path) => `./${path}`),
  message: `${message} See .claude/rules/architecture.md.`,
}))

const LINKED_CSS =
  'CSS stays in the linked stylesheet, so merchant overrides keep winning. Import the CSS module and bind its classes with classMap.'
const SAFE_CUSTOM_ELEMENT =
  'Register the tag with safeCustomElement from @/shared/ui/lit/safe-custom-element, so the first bundle on the page wins.'
const INNER_HTML_BAN = {
  selector: 'AssignmentExpression > MemberExpression.left[property.name="innerHTML"]',
  message: 'No innerHTML assignment: render with a Lit template, which escapes text.',
}
const DEFINE_BAN = {
  selector:
    'CallExpression[callee.property.name="define"][callee.object.name="customElements"], CallExpression[callee.property.name="define"][callee.object.property.name="customElements"]',
  message: `No customElements.define: ${SAFE_CUSTOM_ELEMENT}`,
}
const SRC_BANS = [
  {
    selector: ':matches(ClassDeclaration, ClassExpression)[superClass.name="LitElement"]',
    message:
      'No LitElement subclass: extend LightDomElement from @/shared/ui/lit/light-dom-element, which renders in light DOM so merchant CSS applies.',
  },
  {
    selector: 'CallExpression[callee.property.name="attachShadow"]',
    message: 'No attachShadow: a shadow root stops merchant CSS.',
  },
  {
    selector: ':matches(PropertyDefinition, MethodDefinition)[static=true][key.name="styles"]',
    message: `No static styles: ${LINKED_CSS}`,
  },
  {
    selector: 'MemberExpression[property.name="adoptedStyleSheets"]',
    message: `No adoptedStyleSheets: ${LINKED_CSS}`,
  },
  {
    selector: 'Decorator > CallExpression.expression[callee.name="customElement"]',
    message: `No @customElement: ${SAFE_CUSTOM_ELEMENT}`,
  },
  DEFINE_BAN,
  INNER_HTML_BAN,
  {
    selector: 'Property[key.name="timeZone"]',
    message:
      "No timeZone option: dates stay in the shopper's local time, like master. Use the helpers in @/shared/lib/date.",
  },
  {
    selector: 'ImportExpression',
    message: 'No dynamic import(): everything ships in the one UMD bundle. Use a static import.',
  },
]

const RELATIVE_IMPORTS = {
  group: ['.*'],
  message: 'Use the @/ alias instead of a relative import.',
}
const UNSAFE_LIT = {
  group: [
    'lit/directives/unsafe-*',
    'lit-html/directives/unsafe-*',
    'lit/static-html.js',
    'lit-html/static.js',
  ],
  message:
    'No unsafe directive or static-html: render with a plain Lit template, which escapes text.',
}
const LIT_IN_DOMAIN = {
  group: [
    'lit',
    'lit/*',
    'lit-html',
    'lit-html/*',
    'lit-element',
    'lit-element/*',
    '@lit/*',
    '@lit-labs/*',
  ],
  message: 'domain/ is plain TypeScript. Lit code goes in widgets/ or shared/ui/.',
}

const TESTS = ['src/**/*.test.ts', 'src/**/__tests__/**', 'src/test/**']

module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:lit/recommended',
    'plugin:lit-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.test.json'],
  },
  ignorePatterns: ['/*.*'],
  rules: {
    // TypeScript reports undefined names, and the vitest globals have no ESLint environment.
    'no-undef': 'off',
    'no-console': 'error',
    'no-param-reassign': ['error', { props: true }],
    'no-void': ['error', { allowAsStatement: true }],
    'no-restricted-imports': ['error', { patterns: [RELATIVE_IMPORTS] }],
    'import/no-restricted-paths': ['error', { basePath: __dirname, zones: LAYER_ZONES }],
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    // Vite bundles every import into dist/, so any file may import a devDependency.
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never' }],
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'parent', 'internal', 'sibling', 'index'],
        pathGroups: [
          { pattern: '@/**', group: 'internal' },
          { pattern: '^@/**/*.module.css', group: 'sibling', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      rules: {
        'no-restricted-syntax': ['error', ...SRC_BANS],
        'no-restricted-imports': ['error', { patterns: [RELATIVE_IMPORTS, UNSAFE_LIT] }],
      },
    },
    {
      // An override replaces the rule's options, so this repeats the src/ patterns.
      files: ['src/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          { patterns: [RELATIVE_IMPORTS, UNSAFE_LIT, LIT_IN_DOMAIN] },
        ],
      },
    },
    {
      // Tests and stories put the layers together.
      files: [...TESTS, 'src/**/*.stories.ts'],
      rules: { 'import/no-restricted-paths': 'off' },
    },
    {
      // Tests build their DOM by hand and define test tags.
      files: TESTS,
      rules: {
        'no-restricted-syntax': [
          'error',
          ...SRC_BANS.filter((ban) => ban !== INNER_HTML_BAN && ban !== DEFINE_BAN),
        ],
      },
    },
    {
      // Contract tests run on the built bundles. They import each other with relative paths.
      files: ['tests/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/*', 'src', 'src/*', '**/src', '**/src/*'],
                message:
                  'Contract tests run on the built bundles in dist-ref/ and dist/. They never import from src/.',
              },
            ],
          },
        ],
      },
    },
  ],
  settings: {
    'import/parsers': { '@typescript-eslint/parser': ['.ts'] },
    'import/resolver': { typescript: { alwaysTryTypes: true, project: ['./tsconfig.test.json'] } },
  },
}
