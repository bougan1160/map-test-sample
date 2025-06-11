const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const setTimeout = require('timers/promises').setTimeout;
const { toMatchImageSnapshot } = require('jest-image-snapshot');

describe('Index HTML Test with Puppeteer', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // Add custom matcher for image snapshot
    expect.extend({ toMatchImageSnapshot });

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ja']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP'
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should load the map element', async () => {
    await page.goto('http://localhost:8080');

    // Wait for the map element to be loaded
    await page.waitForSelector('.geolonia');

    // Check if the map element exists
    const mapElement = await page.$('.geolonia');
    expect(mapElement).not.toBeNull();

    // Check map element attributes
    const lat = await page.evaluate(el => el.getAttribute('data-lat'), mapElement);
    const lng = await page.evaluate(el => el.getAttribute('data-lng'), mapElement);
    const zoom = await page.evaluate(el => el.getAttribute('data-zoom'), mapElement);

    expect(lat).toBe('35.681236');
    expect(lng).toBe('139.767125');
    expect(zoom).toBe('16');
  });

  test('should match screenshot', async () => {
    await page.goto('http://localhost:8080');

    // Wait for the map element to be loaded
    await page.waitForSelector('.geolonia');

    // Check if the map element exists
    const mapElement = await page.$('.geolonia');
    expect(mapElement).not.toBeNull();

    // Since the map takes time to load, we need to wait for it to be fully rendered
    // In Puppeteer, we can wait for network to be idle
    try {
      // Try to wait for network idle - this might not work if we're already on the page
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
    } catch (e) {
      // If navigation timeout occurs, it's likely because we're already on the page
      console.log('Navigation timeout occurred, continuing with test...');
    }

    // Add additional wait time to ensure map is fully loaded
    await setTimeout(10000);


    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.resolve(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Create snapshots directory if it doesn't exist
    const snapshotsDir = path.resolve(screenshotsDir, 'index.test.js-snapshots');
    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    // Determine platform suffix for the filename
    const platform = process.platform;
    const platformSuffix = platform === 'linux' ? '-linux' : 
                          platform === 'darwin' ? '-darwin' : 
                          platform === 'win32' ? '-win32' : '';

    // Take screenshot and compare with reference
    const screenshotPath = path.join(snapshotsDir, `test-puppeteer-index-map${platformSuffix}.png`);

    // Take screenshot as buffer for comparison
    const screenshot = await page.screenshot({
      path: screenshotPath, // Still save the screenshot for reference
      fullPage: true
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Compare screenshot with reference image
    // The reference image should be in the __image_snapshots__ directory
    // If it doesn't exist, this will create it
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotsDir: snapshotsDir,
      customSnapshotIdentifier: `puppeteer-index-map${platformSuffix}`,
      // Allow more difference due to map rendering variations
      failureThreshold: 0.2, // Allow up to 20% of pixels to be different
      failureThresholdType: 'percent'
    });

    await fs.unlinkSync(screenshotPath);
  });
});
