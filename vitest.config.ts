import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './setupTests.ts',
    clearMocks: true,
    coverage: {
      include: ['src/**/*.ts(x)?'],
      reporter: ['text', 'lcov', 'clover'],
    },
    globals: true,
    environment: 'happy-dom',
  },
});
