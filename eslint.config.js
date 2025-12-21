import love from 'eslint-config-love'

export default [
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      '.astro/**/*',
      '**/*.d.ts',
      'eslint.config.js'
    ]
  },
  {
    ...love,
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...love.rules,
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      'no-console': 'off'
    }
  }
]