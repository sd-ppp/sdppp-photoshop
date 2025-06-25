import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    globals: true,
    testTimeout: 30000,
  },
}); 