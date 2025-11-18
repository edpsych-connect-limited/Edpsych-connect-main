import nextConfig from 'eslint-config-next';
import tsESLintPlugin from '@typescript-eslint/eslint-plugin';
import tsESLintParser from '@typescript-eslint/parser';

export default [
  ...nextConfig,
  {
    plugins: {
      '@typescript-eslint': tsESLintPlugin,
    },
    languageOptions: {
      parser: tsESLintParser,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-explicit-any': 'off',
      'no-unused-expressions': 'off',
      'no-var-requires': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': ['warn', { forbid: ['>', '"', '}'] }],
      '@next/next/no-img-element': 'warn',
      '@next/next/no-assign-module-variable': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
];

