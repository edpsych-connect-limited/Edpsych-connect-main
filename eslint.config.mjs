import js from '@eslint/js';
console.log("CONFIG LOADED");
import path from 'path';
import { fileURLToPath } from 'url';
import tsESLintPlugin from '@typescript-eslint/eslint-plugin';
import tsESLintParser from '@typescript-eslint/parser';
import nextConfig from 'eslint-config-next/core-web-vitals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract the @next/next plugin from the upstream config so we can alias it to "next"
// This allows rules like "next/no-img-element" to work.
const nextPlugin = nextConfig.find(cfg => cfg.plugins?.['@next/next'])?.plugins['@next/next'];

export default [
  {
    ignores: [".next/*", "node_modules/*"]
  },
  // Use the Flat Config exported by eslint-config-next directly
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@typescript-eslint': tsESLintPlugin,
      // Alias the plugin to 'next' to support legacy rule names
      ...(nextPlugin ? { next: nextPlugin } : {}),
    },
    languageOptions: {
      parser: tsESLintParser,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-explicit-any': 'off',
      'no-unused-expressions': 'off',
      'no-var-requires': 'off',
      'next/no-img-element': 'warn',
      'next/no-assign-module-variable': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
];


