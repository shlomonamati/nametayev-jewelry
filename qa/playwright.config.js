// @ts-check
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test-report' }]],
  use: { baseURL: 'http://127.0.0.1:4173', locale: 'he-IL' },
  // Serves the site folder (one level up) exactly as Vercel does: static files, no build
  webServer: { command: 'npx http-server .. -p 4173 -a 127.0.0.1 -s -c-1', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
