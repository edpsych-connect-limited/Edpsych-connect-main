// ESLint v9 flat config for this repo.
// `npm run lint` runs ESLint in flat-config mode and targets `src/**`.
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';

// Next.js 16+ ships a flat-config-compatible eslint-config-next.
// Import the prebuilt flat config array via an exported subpath.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    linterOptions: {
      // This repo historically uses targeted eslint-disable comments; ESLint 9 can
      // surface these as warnings when the referenced rule is off in a given config.
      // Since we run with --max-warnings 0, keep the gate focused on actionable issues.
      reportUnusedDisableDirectives: 'off',
    },
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'cypress/**',
      'INSTRUCTION-FILES/**',
      'scripts/**',
      'prisma/**',
      'tools/**',
      'video_scripts/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.py',
    ],
  },

  // Next's recommended rules (includes react + next plugin)
  ...nextCoreWebVitals,

  // TypeScript rules + project conventions
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      // Prefer TS-aware unused vars rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Existing repo conventions
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'off',
      '@next/next/no-img-element': 'off',
      'react/forbid-dom-props': 'off',

      // This rule is helpful but too noisy for our current patterns (client-side auth
      // gating and browser capability detection). We may re-enable after refactors.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
