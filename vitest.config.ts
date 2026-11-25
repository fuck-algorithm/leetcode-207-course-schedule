import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['tests/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/algorithm/**/*.ts', 'src/hooks/**/*.ts'],
      exclude: ['**/*.test.ts', 'src/algorithm/types.ts'],
      thresholds: { lines: 60, functions: 60, branches: 50 },
    },
  },
});
