// TODO: figure out why eslint cannot resolve 'vitest/config'
// eslint-disable-next-line import/no-unresolved
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './setupTests.ts',
    clearMocks: true,
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        'setupTests.ts',
        '**/index.ts',
      ],
      reporter: ['text', 'lcov', 'clover'],
    },
    globals: true,
    environment: 'jsdom',
  },
});
