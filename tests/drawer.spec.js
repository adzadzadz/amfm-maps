const { test, expect } = require('@playwright/test');

test.describe('AMFM Maps Drawer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Start the test server
    await page.goto('http://localhost:8000/test-drawer.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display test page correctly', async ({ page }) => {
    // Check if the page loads with expected elements
    await expect(page.locator('h1')).toContainText('Drawer Test');
    await expect(page.locator('.test-container')).toBeVisible();
    await expect(page.locator('.test-pin')).toBeVisible();
  });

  test('should have openDrawer function available', async ({ page }) => {
    // Check if the global drawer functions are available
    const openDrawerExists = await page.evaluate(() => typeof window.openDrawer === 'function');
    expect(openDrawerExists).toBe(true);

    const closeDrawerExists = await page.evaluate(() => typeof window.closeDrawer === 'function');
    expect(closeDrawerExists).toBe(true);
  });

  test('should create drawer when pin is clicked', async ({ page }) => {
    // Click the test pin
    await page.locator('.test-pin').click();
    
    // Wait a moment for drawer creation
    await page.waitForTimeout(200);
    
    // Check if drawer elements are created
    const drawer = page.locator('.amfm-drawer');
    const overlay = page.locator('.amfm-drawer-overlay');
    
    await expect(drawer).toBeAttached();
    await expect(overlay).toBeAttached();
  });

  test('should show drawer with proper animation', async ({ page }) => {
    // Click the test pin
    await page.locator('.test-pin').click();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Check if drawer has 'open' class and overlay has 'visible' class
    const drawerHasOpenClass = await page.locator('.amfm-drawer').evaluate(el => el.classList.contains('open'));
    const overlayHasVisibleClass = await page.locator('.amfm-drawer-overlay').evaluate(el => el.classList.contains('visible'));
    
    expect(drawerHasOpenClass).toBe(true);
    expect(overlayHasVisibleClass).toBe(true);
  });

  test('should display drawer content correctly', async ({ page }) => {
    // Click the test pin
    await page.locator('.test-pin').click();
    
    // Wait for content to load
    await page.waitForTimeout(300);
    
    // Check if drawer content is visible
    await expect(page.locator('.amfm-drawer-title')).toContainText('Test Location');
    await expect(page.locator('.amfm-drawer-rating-score')).toContainText('4.5');
    await expect(page.locator('.amfm-drawer-address-text')).toContainText('123 Test Street');
    await expect(page.locator('.amfm-drawer-btn')).toContainText('Test Button');
  });

  test('should close drawer when close button is clicked', async ({ page }) => {
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(300);
    
    // Verify drawer is open
    await expect(page.locator('.amfm-drawer.open')).toBeVisible();
    
    // Click close button
    await page.locator('.amfm-drawer-close').click();
    await page.waitForTimeout(200);
    
    // Check if drawer is closed
    const drawerHasOpenClass = await page.locator('.amfm-drawer').evaluate(el => el.classList.contains('open'));
    expect(drawerHasOpenClass).toBe(false);
  });

  test('should close drawer when overlay is clicked', async ({ page }) => {
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(300);
    
    // Verify drawer is open
    await expect(page.locator('.amfm-drawer.open')).toBeVisible();
    
    // Click overlay
    await page.locator('.amfm-drawer-overlay').click();
    await page.waitForTimeout(200);
    
    // Check if drawer is closed
    const drawerHasOpenClass = await page.locator('.amfm-drawer').evaluate(el => el.classList.contains('open'));
    expect(drawerHasOpenClass).toBe(false);
  });

  test('should have correct CSS positioning and visibility', async ({ page }) => {
    // Click the test pin
    await page.locator('.test-pin').click();
    await page.waitForTimeout(500);
    
    // Check CSS properties
    const drawerStyles = await page.locator('.amfm-drawer.open').evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        position: computedStyle.position,
        bottom: computedStyle.bottom,
        width: computedStyle.width,
        transform: computedStyle.transform,
        zIndex: computedStyle.zIndex
      };
    });
    
    const overlayStyles = await page.locator('.amfm-drawer-overlay.visible').evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        position: computedStyle.position,
        opacity: computedStyle.opacity,
        visibility: computedStyle.visibility,
        zIndex: computedStyle.zIndex
      };
    });
    
    // Verify drawer positioning
    expect(drawerStyles.position).toBe('absolute');
    expect(drawerStyles.bottom).toBe('0px');
    expect(drawerStyles.transform).not.toBe('translateY(100%)'); // Should not be hidden
    expect(parseInt(drawerStyles.zIndex)).toBeGreaterThan(1000);
    
    // Verify overlay visibility
    expect(overlayStyles.position).toBe('absolute');
    expect(parseFloat(overlayStyles.opacity)).toBeGreaterThan(0);
    expect(overlayStyles.visibility).toBe('visible');
    expect(parseInt(overlayStyles.zIndex)).toBeGreaterThan(1000);
  });

  test('should handle multiple drawer openings correctly', async ({ page }) => {
    // Open drawer first time
    await page.locator('.test-pin').click();
    await page.waitForTimeout(300);
    
    // Close drawer
    await page.locator('.amfm-drawer-close').click();
    await page.waitForTimeout(200);
    
    // Open drawer second time
    await page.locator('.test-pin').click();
    await page.waitForTimeout(300);
    
    // Verify drawer is open and working
    await expect(page.locator('.amfm-drawer.open')).toBeVisible();
    await expect(page.locator('.amfm-drawer-title')).toContainText('Test Location');
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Click the test pin
    await page.locator('.test-pin').click();
    await page.waitForTimeout(500);
    
    // Close drawer
    await page.locator('.amfm-drawer-close').click();
    await page.waitForTimeout(200);
    
    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('AMFM Maps Drawer Visual Tests', () => {
  test('should have proper visual appearance', async ({ page }) => {
    await page.goto('http://localhost:8000/test-drawer.html');
    await page.waitForLoadState('networkidle');
    
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(500);
    
    // Take screenshot of drawer
    await expect(page.locator('.test-container')).toHaveScreenshot('drawer-open.png', {
      threshold: 0.3
    });
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8000/test-drawer.html');
    await page.waitForLoadState('networkidle');
    
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(500);
    
    // Check drawer is visible and properly sized
    const drawerBounds = await page.locator('.amfm-drawer.open').boundingBox();
    expect(drawerBounds.width).toBeGreaterThan(300); // Should be responsive
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    const drawerBoundsDesktop = await page.locator('.amfm-drawer.open').boundingBox();
    expect(drawerBoundsDesktop.width).toBeGreaterThan(400); // Should be larger on desktop
  });
});
