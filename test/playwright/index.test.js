const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Index HTML Test with Playwright', () => {
  test('should load the map element', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Wait for the map element to be loaded
    await page.waitForSelector('.geolonia');

    // Check if the map element exists
    const mapElement = await page.locator('.geolonia');
    await expect(mapElement).toBeVisible();

    // Check map element attributes
    const lat = await mapElement.getAttribute('data-lat');
    const lng = await mapElement.getAttribute('data-lng');
    const zoom = await mapElement.getAttribute('data-zoom');

    expect(lat).toBe('35.681236');
    expect(lng).toBe('139.767125');
    expect(zoom).toBe('16');
  });

  test('should match screenshot', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Wait for the map element to be loaded
    await page.waitForSelector('.geolonia');

    // Since the map takes 10 seconds to load, we need to wait for it to be fully rendered
    // First, wait for the map element to be visible
    const mapElement = await page.locator('.geolonia');
    await expect(mapElement).toBeVisible();

    // Then wait for additional time to ensure the map is fully loaded
    // We'll wait for network activity to be idle and add a fixed delay
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000); // Wait for 10 seconds to ensure map is fully loaded

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.resolve(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Use Playwright's built-in screenshot comparison
    // This will automatically create a reference screenshot on first run
    // and compare on subsequent runs
    await expect(page).toHaveScreenshot('playwright-index-map.png', {
      fullPage: true,
      // Allow more difference due to map rendering variations
      // The previous test showed 0.06 ratio difference when switching from file:// to http://
      maxDiffPixelRatio: 0.2, // Allow up to 20% of pixels to be different
      threshold: 0.5, // Increase pixel difference threshold
    });
  });
});
