import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/**
 * Flat ESLint config (ESLint v9+).
 *
 * Stack-aware per CLAUDE.md: React 19 functional components + hooks only,
 * Vite + browser runtime. Both plugins below natively support ESLint 10.
 * eslint-plugin-react is intentionally omitted: its latest release (7.37.5)
 * caps its peer dependency at ESLint ^9.7 and crashes on v10's removed APIs.
 *   - react-hooks   → enforces the rules of hooks across the custom hooks.
 *   - react-refresh → keeps modules Fast-Refresh-safe (component-only exports).
 */
export default [
  // Build output and generated assets are never linted.
  { ignores: ['dist/**', 'dev-dist/**', 'node_modules/**'] },

  // Application + hook source — browser runtime, JSX enabled.
  {
    files: ['src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      ...reactRefresh.configs.vite.rules,
    },
  },

  // Service Worker — service-worker globals (self, skipWaiting, etc.).
  {
    files: ['public/sw.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.serviceworker },
    },
    rules: { ...js.configs.recommended.rules },
  },

  // Build tooling — Node/module environment.
  {
    files: ['*.config.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { ...js.configs.recommended.rules },
  },
]
