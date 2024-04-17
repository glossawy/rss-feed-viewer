import globals from 'globals'
import eslint from '@eslint/js'
import tsEslint from 'typescript-eslint'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintImport from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'

export default tsEslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['dist/**/*'],
  extends: [
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    prettierConfig,
  ],
  plugins: {
    'react-refresh': reactRefresh,
    import: eslintImport,
    'react-hooks': reactHooks,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2020,
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    semi: ['error', 'never'],
    'sort-imports': [
      'warn',
      { ignoreDeclarationSort: true, allowSeparatedGroups: true },
    ],
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        pathGroups: [
          { pattern: '@mantine/**/*', group: 'external' },
          { pattern: '@testing-library/**/*', group: 'external' },
          { pattern: '@tanstack/**/*', group: 'external' },
          { pattern: '@testing/**/*', group: 'internal' },
          { pattern: '@app/**/*', group: 'internal' },
          { pattern: '@mocks/**/*', group: 'internal' },
          { pattern: 'bun:*', group: 'builtin' },
        ],
        pathGroupsExcludedImportTypes: [],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
})
