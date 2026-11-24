import { defineConfig, devices } from '@playwright/test';

// Locally the installed Chrome runs the tests (PW_CHANNEL overrides); CI installs Playwright's own Chromium.
const channel = process.env.PW_CHANNEL ?? (process.env.CI ? undefined : 'chrome');
// PW_PORT gives a run its own preview server, so two checkouts tested at once never test each other's build.
const port = Number(process.env.PW_PORT ?? 4173);
const base = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: base, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel } },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true, channel } }
  ],
  webServer: { command: `npx vite preview --port ${port} --strictPort`, url: base, reuseExistingServer: !process.env.CI, timeout: 60_000 }
});
