import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts on purpose: tests need no React plugin and no build settings.
export default defineConfig({
  resolve: {
    alias: { '@': process.cwd() },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
