import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:41732',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on',
    ...devices['Desktop Chrome'],
    launchOptions: { executablePath: '/snap/bin/chromium', args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 41732',
    url: 'http://127.0.0.1:41732',
    reuseExistingServer: !process.env.CI,
  },
});
