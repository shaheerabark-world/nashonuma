/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

// Every JSX element goes through src/i18n/jsx-runtime.ts, which translates string
// children and placeholder/title/aria-label for MN and UR (same as the prototype).
export default defineConfig({
  plugins: [react({ jsxImportSource: '@nn' })],
  resolve: {
    alias: [
      { find: '@nn/jsx-runtime', replacement: src('i18n/jsx-runtime.ts') },
      { find: '@nn/jsx-dev-runtime', replacement: src('i18n/jsx-dev-runtime.ts') },
      { find: /^@\//, replacement: src('') }
    ]
  },
  // /api goes to the NestJS backend (../nashonuma-api), so the browser sees one origin.
  server: {
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
  },
  // Note: in dev, plugin-react pre-bundles the @nn runtime with its own copy of src/i18n/lang.ts.
  // lang.ts keeps the language on globalThis so both copies agree (see the comment there).
  test: {
    environment: 'node',
    // Tests always use the localStorage store and sample data, even if .env turns the API on.
    env: { VITE_API_URL: '' },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
});
