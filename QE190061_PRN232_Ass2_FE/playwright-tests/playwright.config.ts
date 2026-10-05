import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Tests can be slow against Render's free tier (cold start up to 60s)
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false, // serialize so the API cache & cleanup stay sane
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'https://qe190061-prn232-ass1-fe.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true,
    viewport: { width: 1366, height: 900 },
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
