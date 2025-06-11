const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: '.',
  timeout: 30000, // Increase timeout for browser tests
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'ja-JP',
    extraHTTPHeaders: {
      'Accept-Language': 'ja-JP,ja;q=0.9'
    },
  },
  reporter: 'list',
  // Configure screenshot comparison
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 2000, // Allow more pixels to be different
      maxDiffPixelRatio: 0.1, // Allow up to 10% of pixels to be different
      threshold: 0.3, // Increase pixel difference threshold
    },
  },
  // Set the screenshots directory
  snapshotDir: path.join(__dirname, '../screenshots'),
});
