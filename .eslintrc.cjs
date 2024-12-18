module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    React: true,
    JSX: true,
    NodeJS: true,
  },
  root: true,
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'react-app',
    'react-app/jest',
    'airbnb',
    'eslint:recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'prettier', 'jsx-a11y', 'import'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['/*.*', 'src/utils/polyfills.js'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'prettier/prettier': ['error'],
    'react/style-prop-object': [
      'error',
      {
        allow: ['FormattedNumber', 'FormattedDateParts', 'FormattedRelativeTime'],
      },
    ],
    'testing-library/no-node-access': 'off',
    'testing-library/no-container': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['.*'],
      },
    ],
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
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowTernary: true,
      },
    ],
    'react/jsx-props-no-spreading': [
      'error',
      {
        exceptions: ['div', 'input', 'svg', 'Modal'],
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-useless-fragment': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': 'off',
    'react/no-unstable-nested-components': [
      'error',
      {
        allowAsProps: true,
      },
    ],
    'import/prefer-default-export': 'off',
    'prefer-destructuring': 'off',
    'import/no-cycle': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.tsx',
          '**/*.test.ts',
          '**/test/**',
          '**/__tests__/**',
          '**/setupTests.ts',
          "test-utils"
        ],
      },
    ],
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
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
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
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        required: {
          some: ['nesting', 'id'],
        },
      },
    ],
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
  },
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
