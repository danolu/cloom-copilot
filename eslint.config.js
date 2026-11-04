import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.next/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        document: 'readonly',
      },
    },
  },
  {
    // Client code must go through the API routes, never import server modules
    // (they pull in node:fs / node:child_process and the Meta API key).
    files: ['src/app/**/*.tsx', 'src/components/**/*', 'src/hooks/**/*', 'src/lib/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/server/*', '**/server/*'],
              message: 'Client code must call API routes instead of importing server modules.',
            },
          ],
        },
      ],
    },
  },
);
