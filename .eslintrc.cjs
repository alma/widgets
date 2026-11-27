// Lint bans only what protects merchants and shoppers. Review covers the other rules of
// .claude/rules/.

// The layers of src/, lowest first. A folder imports only itself and the layers below it, so the
// folders of one layer don't import each other.
const LAYERS = [['lib', 'config'], 'domain', 'shared', 'widgets', 'public-api']
// The Crowdin catalogues, which only createIntl reads.
const EXTRA_IMPORTS = { shared: ['intl'] }
// Each widget stays private to its folder, except the controller that payment-plans opens the
// modal with.
const WIDGET_IMPORTS = {
  'payment-plans': ['eligibility-modal/controllers/plans-modal.controller.ts'],
  'eligibility-modal': [],
}
const PLAIN_TS_LAYERS = ['lib', 'config', 'domain']

const RULES_DOC = 'See .claude/rules/architecture.md.'
const listOf = (paths) => {
  // Folders get a trailing slash, files don't.
  const names = paths.map((path) => (path.includes('.') ? path : `${path}/`))
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

// No zone allows src/index.ts or src/test/, so no layer imports them.
const LAYER_ZONES = LAYERS.flatMap((layer, index) => {
  const below = LAYERS.slice(0, index).flat()
  return [layer].flat().map((folder) => {
    const allowed = [...below, ...(EXTRA_IMPORTS[folder] ?? [])]
    const rule = allowed.length
      ? `${folder}/ imports only ${listOf(allowed)}.`
      : `${folder}/ imports nothing else from src/.`
    return {
      target: `./src/${folder}`,
      from: './src',
      except: [folder, ...allowed].map((path) => `./${path}`),
      message: `${rule} ${RULES_DOC}`,
    }
  })
})
const WIDGET_ZONES = Object.entries(WIDGET_IMPORTS).map(([widget, allowed]) => {
  const rule = allowed.length
    ? `widgets/${widget}/ imports another widget only through ${listOf(allowed.map((path) => `widgets/${path}`))}.`
    : `widgets/${widget}/ imports no other widget.`
  return {
    target: `./src/widgets/${widget}`,
    from: './src/widgets',
    except: [widget, ...allowed].map((path) => `./${path}`),
    message: `${rule} ${RULES_DOC}`,
  }
})
const ENTRY_ZONE = {
  target: './src/index.ts',
  from: './src',
  except: ['./main.css', './public-api'],
  message: `src/index.ts imports only main.css and public-api/. ${RULES_DOC}`,
}

const SAFE_CUSTOM_ELEMENT =
  'Register the tag with safeCustomElement from @/shared/custom-elements/safe-custom-element, so the first bundle on the page wins.'
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
      'No LitElement subclass: extend ShadowDomElement from @/shared/custom-elements/shadow-dom-element, or LightDomElement for an element that has not moved into its shadow root yet.',
  },
  {
    selector: 'CallExpression[callee.property.name="attachShadow"]',
    message: 'No attachShadow: extend ShadowDomElement, which Lit gives an open shadow root.',
  },
  {
    selector:
      ':matches(ClassDeclaration, ClassExpression)[superClass.name="LightDomElement"] > ClassBody > :matches(PropertyDefinition, MethodDefinition)[static=true][key.name="styles"]',
    message:
      'No static styles on a LightDomElement: Lit adopts them only into a shadow root, so they would never apply. Import the CSS module and bind its classes with classMap.',
  },
  {
    selector: 'MemberExpression[property.name="adoptedStyleSheets"]',
    message: 'No adoptedStyleSheets: put the CSS in static styles, which Lit adopts into the shadow root.',
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
      "No timeZone option: dates stay in the shopper's local time, like master. Use the helpers in @/lib/date.",
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
const LIT_IMPORTS = {
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
  message: `${listOf(PLAIN_TS_LAYERS)} are plain TypeScript. Lit code goes in widgets/ or shared/.`,
}

// paths matches the exact specifier, so src/test/setup.ts still imports vitest-axe/matchers.
const VITEST_AXE = {
  name: 'vitest-axe',
  message: 'Axe runs go in a .accessibility.test.ts file. See A11Y-09.',
}

const TESTS = ['src/**/*.test.ts', 'src/test/**']

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
    project: ['./tsconfig.app.json', './tsconfig.test.json'],
  },
  ignorePatterns: ['/*.*'],
  rules: {
    // TypeScript reports undefined names, and the vitest globals have no ESLint environment.
    'no-undef': 'off',
    'no-console': 'error',
    'no-param-reassign': ['error', { props: true }],
    'no-void': ['error', { allowAsStatement: true }],
    'no-restricted-imports': ['error', { patterns: [RELATIVE_IMPORTS] }],
    'import/no-restricted-paths': [
      'error',
      { basePath: __dirname, zones: [...LAYER_ZONES, ...WIDGET_ZONES, ENTRY_ZONE] },
    ],
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
        'no-restricted-imports': [
          'error',
          { paths: [VITEST_AXE], patterns: [RELATIVE_IMPORTS, UNSAFE_LIT] },
        ],
      },
    },
    {
      // An override replaces the rule's options, so this repeats the src/ patterns.
      files: PLAIN_TS_LAYERS.map((folder) => `src/${folder}/**/*.ts`),
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: [VITEST_AXE], patterns: [RELATIVE_IMPORTS, UNSAFE_LIT, LIT_IMPORTS] },
        ],
      },
    },
    {
      // Accessibility tests may import vitest-axe. The last matching override wins, so this one
      // comes after the two above.
      files: ['src/**/*.accessibility.test.ts'],
      rules: {
        'no-restricted-imports': ['error', { patterns: [RELATIVE_IMPORTS, UNSAFE_LIT] }],
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
                  'Contract tests run on the built bundle in dist/. They never import from src/.',
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
