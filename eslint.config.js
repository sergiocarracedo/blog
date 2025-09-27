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
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        ...love.languageOptions.parserOptions,
        project: './tsconfig.json'
      }
    },
    rules: {
      ...love.rules,
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off'
    }
  }
]