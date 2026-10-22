// eslint-config-airbnb-base is the part of the airbnb preset that master extended, without the
// React rules. The project adds its own bans to the restricted globals and properties of the preset.
const AIRBNB_VARIABLES = require('eslint-config-airbnb-base/rules/variables').rules
const AIRBNB_BEST_PRACTICES = require('eslint-config-airbnb-base/rules/best-practices').rules
const AIRBNB_ES6 = require('eslint-config-airbnb-base/rules/es6').rules
const AIRBNB_STYLE = require('eslint-config-airbnb-base/rules/style').rules

// The preset lists most globals by name only. The message says what to write instead.
const AIRBNB_GLOBALS = AIRBNB_VARIABLES['no-restricted-globals'].slice(1).map((entry) =>
  typeof entry === 'string'
    ? {
        name: entry,
        message: `${entry} is a browser global that reads like a local variable. Use window.${entry} if you mean it.`,
      }
    : entry,
)
const AIRBNB_PROPERTIES = AIRBNB_BEST_PRACTICES['no-restricted-properties'].slice(1)
// An override replaces the whole option list of a rule, so this keeps the three other entries.
const AIRBNB_SYNTAX = AIRBNB_STYLE['no-restricted-syntax']
  .slice(1)
  .filter((entry) => entry.selector !== 'ForOfStatement')

// What the preset enables and the project switches off or replaces.
const AIRBNB_OPT_OUTS = {
  // The widget runs in a browser, and its source is TypeScript modules, so the Node, CommonJS, AMD
  // and webpack rules and the monorepo rule have nothing to check.
  'global-require': 'off',
  'no-buffer-constructor': 'off',
  'no-new-require': 'off',
  'no-path-concat': 'off',
  strict: 'off',
  'lines-around-directive': 'off',
  'import/no-amd': 'off',
  'import/no-dynamic-require': 'off',
  'import/no-import-module-exports': 'off',
  'import/no-webpack-loader-syntax': 'off',
  'import/no-relative-packages': 'off',
  // Its list of exceptions names React lifecycle methods.
  'class-methods-use-this': 'off',
  // The preset enforced these on master, and they stay off so this change leaves the checks as they
  // were. Turning them on is a separate change.
  'no-return-await': 'off',
  'unicode-bom': 'off',
  // The build targets ES2021, which has native iterators, so for..of is allowed.
  'no-restricted-syntax': ['error', ...AIRBNB_SYNTAX],
  // typescript-eslint replaces these rules, because the core versions report false positives on
  // types and enums.
  'no-array-constructor': 'off',
  'no-redeclare': 'off',
  'no-shadow': 'off',
  'no-unused-expressions': 'off',
  'no-unused-vars': 'off',
  'no-use-before-define': 'off',
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-redeclare': 'error',
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-use-before-define': AIRBNB_VARIABLES['no-use-before-define'],
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/consistent-type-assertions': 'warn',
  // plugin:prettier/recommended and plugin:import/recommended come after the preset and weaken these
  // rules, so they get the values of the preset back.
  'arrow-body-style': AIRBNB_ES6['arrow-body-style'],
  'prefer-arrow-callback': AIRBNB_ES6['prefer-arrow-callback'],
  'import/no-duplicates': 'error',
  'import/no-named-as-default': 'error',
  'import/no-named-as-default-member': 'error',
}

// Import layers of src/. Each entry names a folder, the other folders of src/
// that its files may import, and the lint message. Tests, stories and src/test/
// are exempt (see overrides).
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

// "from" is all of src/ and "except" lists what the folder may import. No entry
// allows public-api/, src/index.ts or src/test/, so no layer can import them.
const LAYER_ZONES = LAYERS.map(([folder, allowed, message]) => ({
  target: `./src/${folder}`,
  from: './src',
  except: [folder, ...allowed].map((path) => `./${path}`),
  message: `${message} See .claude/rules/architecture.md.`,
}))

const RELATIVE_IMPORTS = {
  group: ['.*'],
  message: 'Use the @/ alias instead of a relative import.',
}

// Every package of the Lit family: lit, its parts (lit-html, lit-element), @lit/* and @lit-labs/*.
const LIT_MESSAGE = 'domain/ is plain TypeScript. Lit code goes in widgets/ or shared/ui/.'
const LIT_PACKAGES = ['lit', 'lit-html', 'lit-element']
const LIT_PATHS = LIT_PACKAGES.map((name) => ({ name, message: LIT_MESSAGE }))
const LIT_PATTERNS = {
  group: [...LIT_PACKAGES.map((name) => `${name}/*`), '@lit/*', '@lit-labs/*'],
  message: LIT_MESSAGE,
}

const DOM_MESSAGE =
  'domain/ is plain TypeScript with no DOM. Code that touches the page goes in widgets/ or shared/ui/.'
const DOM_GLOBALS = [
  'window',
  'document',
  'customElements',
  'HTMLElement',
  'Element',
  'Node',
  'ShadowRoot',
]
const DOM_BANS = DOM_GLOBALS.map((name) => ({ name, message: DOM_MESSAGE }))

// The bans of a list that stay when some of them are lifted.
const without = (bans, removed) => bans.filter((ban) => !removed.includes(ban))

const NETWORK_MESSAGE =
  'Only domain/plans/api/ and shared/lib/http.ts use fetch and sessionStorage.'
const NETWORK_GLOBALS = ['fetch', 'sessionStorage']
const NETWORK_BANS = NETWORK_GLOBALS.map((name) => ({ name, message: NETWORK_MESSAGE }))

// @types/node loads next to the DOM types, so tsc accepts Node globals in browser code. Lint does not.
const NODE_MESSAGE =
  'The widget runs in a browser, where this Node global does not exist. Tests and src/test/ may use it.'
const NODE_BANS = ['Buffer', 'require', '__dirname', '__filename', 'global'].map((name) => ({
  name,
  message: NODE_MESSAGE,
}))
const PROCESS_BAN = {
  name: 'process',
  message:
    'Vite replaces process.env.BUILD_VERSION at build time and nothing else, so any other use of process throws in the browser. Only src/shared/config/ reads it.',
}
const RESTRICTED_GLOBALS = [...AIRBNB_GLOBALS, ...NETWORK_BANS, ...NODE_BANS, PROCESS_BAN]
// The bans that stay in the files that may use the network.
const NON_NETWORK_GLOBALS = without(RESTRICTED_GLOBALS, NETWORK_BANS)
const NETWORK_PROPERTY_BANS = ['window', 'globalThis', 'self'].flatMap((object) =>
  NETWORK_GLOBALS.map((property) => ({ object, property, message: NETWORK_MESSAGE })),
)
const RESTRICTED_PROPERTIES = [...AIRBNB_PROPERTIES, ...NETWORK_PROPERTY_BANS]

// An override that gives a rule no option keeps the base options, so an empty list turns the rule off.
const banList = (bans) => (bans.length > 0 ? ['error', ...bans] : 'off')

const ALLOW_NETWORK = {
  'no-restricted-globals': banList(NON_NETWORK_GLOBALS),
  'no-restricted-properties': banList(
    RESTRICTED_PROPERTIES.filter((ban) => !NETWORK_PROPERTY_BANS.includes(ban)),
  ),
}

const TYPES_ONLY = {
  selector:
    'Program > :not(ImportDeclaration[importKind="type"], ExportNamedDeclaration[exportKind="type"], ExportAllDeclaration[exportKind="type"], TSTypeAliasDeclaration, TSInterfaceDeclaration)',
  message:
    'A .types.ts file holds types only. Use import type and export type, and put enums and other runtime values in a .const.ts file.',
}

// The 4.x bans in src/. Each message starts with what it bans, then names what 4.x uses instead.
const LIGHT_DOM_ELEMENT = 'Extend LightDomElement from @/shared/ui/lit/light-dom-element'
const SAFE_CUSTOM_ELEMENT =
  'Register the tag with safeCustomElement from @/shared/ui/lit/safe-custom-element'
const LINKED_CSS =
  'CSS stays in the linked stylesheet, so merchant overrides keep winning. Import the CSS module and bind its classes with classMap.'
const LIT_ELEMENT_BAN = {
  selector: ':matches(ClassDeclaration, ClassExpression)[superClass.name="LitElement"]',
  message: `No LitElement subclass: ${LIGHT_DOM_ELEMENT}, which renders in light DOM so merchant CSS applies.`,
}
const ATTACH_SHADOW_BAN = {
  selector: 'CallExpression[callee.property.name="attachShadow"]',
  message: `No attachShadow: a shadow root stops merchant CSS. ${LIGHT_DOM_ELEMENT}.`,
}
const STATIC_STYLES_BAN = {
  selector: ':matches(PropertyDefinition, MethodDefinition)[static=true][key.name="styles"]',
  message: `No static styles: ${LINKED_CSS}`,
}
const ADOPTED_STYLE_SHEETS_BAN = {
  selector: 'MemberExpression[property.name="adoptedStyleSheets"]',
  message: `No adoptedStyleSheets: ${LINKED_CSS}`,
}
const CUSTOM_EVENT_BAN = {
  selector: 'NewExpression[callee.name="CustomEvent"]',
  message:
    'No CustomEvent: 4.x adds no events. Call the callback that the merchant passed in the options.',
}
const REFLECT_BAN = {
  selector: 'Property[key.name="reflect"][value.value=true]',
  message: 'No reflect: true: 4.x adds no attributes. Leave reflect off.',
}
const DYNAMIC_IMPORT_BAN = {
  selector: 'ImportExpression',
  message: 'No dynamic import(): everything ships in the one bundle. Use a static import.',
}
const INNER_HTML_BAN = {
  selector: 'AssignmentExpression > MemberExpression.left[property.name="innerHTML"]',
  message:
    'No innerHTML assignment: render with a Lit template, which escapes text. Rich text becomes a template too.',
}
const TIME_ZONE_BAN = {
  selector: 'Property[key.name="timeZone"]',
  message:
    "No timeZone option: dates stay in the shopper's local time, like master. Use the helpers in @/shared/lib/date.",
}
const CUSTOM_ELEMENT_BAN = {
  selector: 'Decorator > CallExpression.expression[callee.name="customElement"]',
  message: `No @customElement: ${SAFE_CUSTOM_ELEMENT}, so the first bundle on the page wins.`,
}
const DEFINE_BAN = {
  selector:
    'CallExpression[callee.property.name="define"][callee.object.name="customElements"], CallExpression[callee.property.name="define"][callee.object.property.name="customElements"]',
  message: `No customElements.define: ${SAFE_CUSTOM_ELEMENT}, so the first bundle on the page wins.`,
}
const SRC_BANS = [
  LIT_ELEMENT_BAN,
  ATTACH_SHADOW_BAN,
  STATIC_STYLES_BAN,
  ADOPTED_STYLE_SHEETS_BAN,
  CUSTOM_EVENT_BAN,
  REFLECT_BAN,
  DYNAMIC_IMPORT_BAN,
  INNER_HTML_BAN,
  TIME_ZONE_BAN,
  CUSTOM_ELEMENT_BAN,
  DEFINE_BAN,
]
const srcSyntax = (bans) => ['error', ...AIRBNB_SYNTAX, ...bans]

// Packages the bundle dropped, with what replaces each of them.
const NO_REACT =
  'The bundle has no React in 4.x. Write a Lit template function or a reactive controller.'
const DROPPED_PACKAGES = [
  ['react', NO_REACT],
  ['react-dom', NO_REACT],
  ['preact', NO_REACT],
  ['react-intl', 'Format messages with the catalogues and helpers in @/shared/i18n.'],
  ['classnames', 'Bind CSS-module classes with classMap from lit/directives/class-map.js.'],
  ['date-fns', 'Use the date helpers in @/shared/lib/date, which give the same results.'],
  [
    'react-modal',
    "The eligibility modal renders react-modal's markup with its own portal controller.",
  ],
  ['react-responsive', 'Use the media query controller in @/shared/ui.'],
  [
    '@testing-library/react',
    'Mount widgets through the public API, as merchants do, and query them with @testing-library/dom.',
  ],
  ['jest-axe', 'Use vitest-axe, whose matchers src/test/setup.ts loads.'],
]
const DROPPED_PATHS = DROPPED_PACKAGES.map(([name, message]) => ({ name, message }))
const DROPPED_PATTERNS = DROPPED_PACKAGES.map(([name, message]) => ({
  group: [`${name}/*`],
  message,
}))
const UNSAFE_LIT = {
  group: [
    'lit/directives/unsafe-*',
    'lit-html/directives/unsafe-*',
    'lit/static-html.js',
    'lit-html/static.js',
  ],
  message:
    'No unsafe directive or static-html: render with a plain Lit template, which escapes text. Rich text becomes a template too.',
}
const IMPORT_BAN_PATTERNS = [...DROPPED_PATTERNS, UNSAFE_LIT]

module.exports = {
  env: {
    browser: true,
    es2021: true,
    // The preset turns the Node globals on. The widget runs in a browser.
    node: false,
  },
  globals: {
    NodeJS: true,
  },
  root: true,
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:lit/recommended',
    'plugin:lit-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  // The lint fixtures break the rules on purpose. npm run test:harness lints them.
  ignorePatterns: ['/*.*', 'src/__lint-fixtures__/'],
  rules: {
    ...AIRBNB_OPT_OUTS,
    'prettier/prettier': ['error'],
    // TypeScript reports undefined names, and the vitest globals have no ESLint environment.
    'no-undef': 'off',
    'no-restricted-imports': ['error', { patterns: [RELATIVE_IMPORTS] }],
    'import/no-restricted-paths': ['error', { basePath: __dirname, zones: LAYER_ZONES }],
    'no-restricted-globals': banList(RESTRICTED_GLOBALS),
    'no-restricted-properties': banList(RESTRICTED_PROPERTIES),
    '@typescript-eslint/consistent-type-imports': 'error',
    'eol-last': ['error', 'always'],
    'no-underscore-dangle': [
      'error',
      {
        allowFunctionParams: true,
        allow: ['_md_env_', '_errors'],
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    'no-void': [
      'error',
      {
        allowAsStatement: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowTernary: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 'off',
    'import/no-cycle': 'error',
    // Vite bundles every import into dist/, so any file may import a devDependency.
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'parent', 'internal', 'sibling', 'index'],
        pathGroups: [
          { pattern: '@/**', group: 'internal' },
          {
            pattern: '^@/**/*.module.css',
            group: 'sibling',
            position: 'before',
          },
        ],

        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
  overrides: [
    {
      // The 4.x bans. An override replaces a rule's options, so the overrides below repeat them.
      files: ['src/**/*.ts'],
      rules: {
        'no-restricted-syntax': srcSyntax(SRC_BANS),
        'no-restricted-imports': [
          'error',
          { paths: DROPPED_PATHS, patterns: [RELATIVE_IMPORTS, ...IMPORT_BAN_PATTERNS] },
        ],
      },
    },
    {
      // domain/ is plain TypeScript. An override replaces the rule's options
      // instead of merging them, so it repeats RELATIVE_IMPORTS and the network bans.
      files: ['src/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [...LIT_PATHS, ...DROPPED_PATHS],
            patterns: [RELATIVE_IMPORTS, LIT_PATTERNS, ...IMPORT_BAN_PATTERNS],
          },
        ],
        'no-restricted-globals': banList([...RESTRICTED_GLOBALS, ...DOM_BANS]),
      },
    },
    {
      files: ['src/domain/plans/api/**/*.ts', 'src/shared/lib/http.ts'],
      rules: ALLOW_NETWORK,
    },
    {
      // The request and the cache use fetch and sessionStorage, and nothing else of the DOM.
      files: ['src/domain/plans/api/**/*.ts'],
      rules: { 'no-restricted-globals': banList([...NON_NETWORK_GLOBALS, ...DOM_BANS]) },
    },
    {
      // The one place that reads the build version Vite injects.
      files: ['src/shared/config/**/*.ts'],
      rules: { 'no-restricted-globals': banList(without(RESTRICTED_GLOBALS, [PROCESS_BAN])) },
    },
    {
      // The base class is the one subclass of LitElement.
      files: ['src/shared/ui/lit/light-dom-element.ts'],
      rules: { 'no-restricted-syntax': srcSyntax(without(SRC_BANS, [LIT_ELEMENT_BAN])) },
    },
    {
      // The registration decorator is the one place that defines a tag.
      files: ['src/shared/ui/lit/safe-custom-element.ts'],
      rules: {
        'no-restricted-syntax': srcSyntax(without(SRC_BANS, [CUSTOM_ELEMENT_BAN, DEFINE_BAN])),
      },
    },
    {
      // Tests and stories put the layers together, so the fetch and sessionStorage bans stay open
      // to them. Tests run in Node, so the Node globals stay open to them too.
      files: ['src/**/*.test.ts', 'src/**/__tests__/**', 'src/**/*.stories.ts', 'src/test/**'],
      rules: {
        'import/no-restricted-paths': 'off',
        // A test may define several classes, for example to apply a decorator twice to one tag.
        // Production code keeps one class per file.
        'max-classes-per-file': 'off',
        ...ALLOW_NETWORK,
        'no-restricted-globals': banList(AIRBNB_GLOBALS),
      },
    },
    {
      // Tests build their DOM by hand and define test tags. Stories don't.
      files: ['src/**/*.test.ts', 'src/**/__tests__/**', 'src/test/**'],
      rules: {
        'no-restricted-syntax': srcSyntax(without(SRC_BANS, [INNER_HTML_BAN, DEFINE_BAN])),
      },
    },
    {
      // Last, so a .types.ts file keeps every ban on top of its own.
      files: ['src/**/*.types.ts'],
      rules: { 'no-restricted-syntax': srcSyntax([...SRC_BANS, TYPES_ONLY]) },
    },
    {
      // Contract tests are black-box tests on the built bundles. They import each other with
      // relative paths, because @/ points to src/, and never import from src/.
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
        'max-classes-per-file': 'off',
        ...ALLOW_NETWORK,
        'no-restricted-globals': banList(AIRBNB_GLOBALS),
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
}
