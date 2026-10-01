//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // Tests index into arrays they just inserted; the extra optional chaining is noise there.
    files: ['tests/**'],
    rules: { '@typescript-eslint/no-unnecessary-condition': 'off' },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]
