import { test, expect } from '@playwright/test';
import { WordPressHelper } from './utils/wordpress-helper';

test.describe('AMFM Map and Filter Integration Tests', () => {
  let wpHelper: WordPressHelper;

  test.beforeEach(async ({ page }) => {
    wpHelper = new WordPressHelper(page);
    wpHelper.setupConsoleLogging();
  });

  test('complete filtering workflow - button layout', async ({ page }) => {
    test.slow(); // Complex integration test
    
    // Navigate to page with both widgets
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for both widgets to initialize
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await wpHelper.waitForGoogleMaps();
    await wpHelper.waitForAMFMMap();
    await page.waitForTimeout(5000); // Extra time for full initialization
    
    // Capture console logs for debugging
    const filterLogs: string[] = [];
    const mapLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Applying external filters:') || 
          text.includes('Filtered locations count:') ||
          text.includes('amfmFilterUpdate')) {
        filterLogs.push(text);
      }
      if (text.includes('loadLocations called with') || 
          text.includes('Map object exists:') ||
          text.includes('Marker created for:')) {
        mapLogs.push(text);
      }
    });
    
    // Step 1: Verify initial state
    const initialCounter = page.locator('[id*="_counter"]');
    let initialCount = 0;
    if (await initialCounter.isVisible()) {
      const counterText = await initialCounter.textContent();
      const match = counterText?.match(/Showing (\d+) location/);
      if (match) {
        initialCount = parseInt(match[1]);
      }
    }
    
    await wpHelper.debugScreenshot('integration-initial-state');
    
    // Step 2: Apply location filter
    const californiaButton = page.locator('.amfm-filter-button[data-filter-value="California"]');
    if (await californiaButton.isVisible()) {
      console.log('Clicking California filter...');
      await californiaButton.click();
      await page.waitForTimeout(3000);
      
      // Verify button is active
      await expect(californiaButton).toHaveClass(/active/);
      
      // Check filter logs
      expect(filterLogs.some(log => log.includes('Applying external filters:'))).toBeTruthy();
      
      await wpHelper.debugScreenshot('integration-california-filter');
    }
    
    // Step 3: Apply gender filter (additive)
    const maleButton = page.locator('.amfm-filter-button[data-filter-value="Male"]');
    if (await maleButton.isVisible()) {
      console.log('Clicking Male filter...');
      await maleButton.click();
      await page.waitForTimeout(3000);
      
      await expect(maleButton).toHaveClass(/active/);
      
      await wpHelper.debugScreenshot('integration-california-male-filter');
    }
    
    // Step 4: Apply conditions filter
    const substanceAbuseButton = page.locator('.amfm-filter-button[data-filter-value="Substance Abuse"]');
    if (await substanceAbuseButton.isVisible()) {
      console.log('Clicking Substance Abuse filter...');
      await substanceAbuseButton.click();
      await page.waitForTimeout(3000);
      
      await expect(substanceAbuseButton).toHaveClass(/active/);
      
      await wpHelper.debugScreenshot('integration-multiple-filters');
    }
    
    // Step 5: Verify filtering occurred
    if (await initialCounter.isVisible()) {
      const filteredCounterText = await initialCounter.textContent();
      const filteredMatch = filteredCounterText?.match(/Showing (\d+) location/);
      if (filteredMatch) {
        const filteredCount = parseInt(filteredMatch[1]);
        // Filtered count should be less than or equal to initial count
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        console.log(`Initial count: ${initialCount}, Filtered count: ${filteredCount}`);
      }
    }
    
    // Step 6: Clear all filters
    const clearButton = page.locator('.amfm-clear-filters');
    if (await clearButton.isVisible()) {
      console.log('Clicking Clear All...');
      await clearButton.click();
      await page.waitForTimeout(3000);
      
      // Verify buttons are no longer active
      await expect(californiaButton).not.toHaveClass(/active/);
      await expect(maleButton).not.toHaveClass(/active/);
      
      await wpHelper.debugScreenshot('integration-filters-cleared');
    }
    
    // Step 7: Verify map returned to initial state
    if (await initialCounter.isVisible()) {
      const finalCounterText = await initialCounter.textContent();
      const finalMatch = finalCounterText?.match(/Showing (\d+) location/);
      if (finalMatch) {
        const finalCount = parseInt(finalMatch[1]);
        expect(finalCount).toBe(initialCount);
      }
    }
    
    // Log captured messages for debugging
    console.log('Filter logs captured:', filterLogs.length);
    console.log('Map logs captured:', mapLogs.length);
    
    // Verify that filtering events occurred
    expect(filterLogs.length).toBeGreaterThan(0);
    expect(mapLogs.length).toBeGreaterThan(0);
  });

  test('error handling during filtering', async ({ page }) => {
    await page.goto('http://localhost:10003/map-test/');
    
    // Capture errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });
    
    // Wait for initialization
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await wpHelper.waitForAMFMMap();
    await page.waitForTimeout(5000);
    
    // Rapidly click multiple filters to test error handling
    const filterButtons = page.locator('.amfm-filter-button:not(.amfm-clear-filters)');
    const buttonCount = await filterButtons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        await filterButtons.nth(i).click();
        await page.waitForTimeout(100); // Rapid clicking
      }
      
      await page.waitForTimeout(3000);
    }
    
    // Clear filters rapidly
    const clearButton = page.locator('.amfm-clear-filters');
    if (await clearButton.isVisible()) {
      for (let i = 0; i < 3; i++) {
        await clearButton.click();
        await page.waitForTimeout(200);
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('net::ERR_') &&
      !error.includes('favicon') &&
      error.includes('AMFM') || error.includes('TypeError') || error.includes('ReferenceError')
    );
    
    expect(criticalErrors.length).toBe(0);
    
    await wpHelper.debugScreenshot('error-handling-test');
  });

  test('performance under load', async ({ page }) => {
    test.slow();
    
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for initialization
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await wpHelper.waitForAMFMMap();
    await page.waitForTimeout(5000);
    
    // Measure performance
    const startTime = Date.now();
    
    // Simulate heavy filtering activity
    const filterButtons = page.locator('.amfm-filter-button:not(.amfm-clear-filters)');
    const buttonCount = await filterButtons.count();
    const clearButton = page.locator('.amfm-clear-filters');
    
    // Perform multiple filter cycles
    for (let cycle = 0; cycle < 3; cycle++) {
      console.log(`Performance test cycle ${cycle + 1}/3`);
      
      // Apply multiple filters
      for (let i = 0; i < Math.min(4, buttonCount); i++) {
        await filterButtons.nth(i).click();
        await page.waitForTimeout(500);
      }
      
      // Clear all
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Performance test completed in ${totalTime}ms`);
    
    // Performance should complete within reasonable time (30 seconds)
    expect(totalTime).toBeLessThan(30000);
    
    await wpHelper.debugScreenshot('performance-test-completed');
  });

  test('cross-browser compatibility', async ({ page, browserName }) => {
    await page.goto('http://localhost:10003/map-test/');
    
    console.log(`Testing on browser: ${browserName}`);
    
    // Wait for initialization with browser-specific timeouts
    const timeout = browserName === 'webkit' ? 20000 : 15000;
    await page.waitForSelector('.amfm-filter-container', { timeout });
    await wpHelper.waitForGoogleMaps(timeout);
    await wpHelper.waitForAMFMMap(undefined, timeout);
    await page.waitForTimeout(5000);
    
    // Basic functionality test
    const filterContainer = page.locator('.amfm-filter-container');
    await expect(filterContainer).toBeVisible();
    
    const mapContainer = page.locator('[id*="amfm_map_v2_"]');
    await expect(mapContainer).toBeVisible();
    
    // Test basic filtering
    const firstFilterButton = page.locator('.amfm-filter-button:not(.amfm-clear-filters)').first();
    if (await firstFilterButton.isVisible()) {
      await firstFilterButton.click();
      await page.waitForTimeout(2000);
      
      await expect(firstFilterButton).toHaveClass(/active/);
    }
    
    await wpHelper.debugScreenshot(`cross-browser-${browserName}`);
  });

  test('mobile responsive integration', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for initialization
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await wpHelper.waitForAMFMMap();
    await page.waitForTimeout(3000);
    
    // Verify both widgets are visible and responsive
    const filterContainer = page.locator('.amfm-filter-container');
    const mapContainer = page.locator('[id*="amfm_map_v2_"]');
    
    await expect(filterContainer).toBeVisible();
    await expect(mapContainer).toBeVisible();
    
    // Check container widths
    const filterBox = await filterContainer.boundingBox();
    const mapBox = await mapContainer.boundingBox();
    
    expect(filterBox?.width).toBeLessThanOrEqual(375);
    expect(mapBox?.width).toBeLessThanOrEqual(375);
    
    // Test filtering on mobile
    const filterButton = page.locator('.amfm-filter-button:not(.amfm-clear-filters)').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(2000);
      
      await expect(filterButton).toHaveClass(/active/);
    }
    
    await wpHelper.debugScreenshot('mobile-responsive-integration');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for initialization
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Check for basic accessibility features
    
    // Verify buttons have accessible text
    const filterButtons = page.locator('.amfm-filter-button');
    const buttonCount = await filterButtons.count();
    
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      const button = filterButtons.nth(i);
      const text = await button.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Verify focus is visible (this is basic, more comprehensive a11y testing would use axe-core)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    await wpHelper.debugScreenshot('accessibility-test');
  });
});
