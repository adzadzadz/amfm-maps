const { test, expect } = require('@playwright/test');

test.describe('AMFM Maps Drawer Visual Requirements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/test-drawer.html');
    await page.waitForLoadState('networkidle');
  });

  test('map container should hide drawer when closed (overflow: hidden)', async ({ page }) => {
    // Check initial state - drawer should be hidden
    const mapContainer = page.locator('.test-container');
    
    // Check if map container has overflow hidden
    const mapContainerOverflow = await mapContainer.evaluate(el => {
      return window.getComputedStyle(el).overflow;
    });
    
    expect(mapContainerOverflow).toBe('hidden');
    
    // Verify drawer is not visible initially
    const drawer = page.locator('.amfm-drawer');
    const isDrawerHidden = await drawer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.transform.includes('translateY(100%)') || style.transform.includes('translateY(500px)');
    });
    
    expect(isDrawerHidden).toBe(true);
  });

  test('drawer should not have rounded edges and match map container width', async ({ page }) => {
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(500);
    
    const drawer = page.locator('.amfm-drawer.open');
    const mapContainer = page.locator('.test-container');
    
    // Check drawer border radius
    const drawerBorderRadius = await drawer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.borderRadius;
    });
    
    // Should have no border radius (0px) or only top border radius
    expect(drawerBorderRadius).toMatch(/^(0px|0px 0px \d+px \d+px)$/);
    
    // Check width matches container
    const drawerBounds = await drawer.boundingBox();
    const containerBounds = await mapContainer.boundingBox();
    
    expect(drawerBounds.width).toBeCloseTo(containerBounds.width, 1);
    expect(drawerBounds.x).toBeCloseTo(containerBounds.x, 1);
  });

  test('images should use owl slider without padding (edge to edge)', async ({ page }) => {
    // Create test content with images
    await page.evaluate(() => {
      const testContent = `
        <div class="amfm-drawer-location">
          <div class="amfm-drawer-photo-slider owl-carousel">
            <div class="amfm-drawer-photo-slide">
              <img src="https://via.placeholder.com/400x240/007cba/ffffff?text=Test+Photo+1" alt="Test photo" loading="lazy">
            </div>
            <div class="amfm-drawer-photo-slide">
              <img src="https://via.placeholder.com/400x240/cc8f2c/ffffff?text=Test+Photo+2" alt="Test photo" loading="lazy">
            </div>
          </div>
          <div class="amfm-drawer-header">
            <h2 class="amfm-drawer-title">Test Location with Images</h2>
          </div>
        </div>
      `;
      
      const mapContainer = document.querySelector('.test-container');
      if (window.openDrawer) {
        window.openDrawer(testContent, mapContainer);
      }
    });
    
    await page.waitForTimeout(800); // Wait for images and carousel
    
    const photoSlider = page.locator('.amfm-drawer-photo-slider');
    const drawerContent = page.locator('.amfm-drawer-content');
    
    // Check if owl carousel is initialized
    const hasOwlClass = await photoSlider.evaluate(el => el.classList.contains('owl-loaded'));
    expect(hasOwlClass).toBe(true);
    
    // Check slider has no padding/margin that would prevent edge-to-edge
    const sliderStyles = await photoSlider.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        marginLeft: style.marginLeft,
        marginRight: style.marginRight,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight
      };
    });
    
    expect(sliderStyles.marginLeft).toBe('0px');
    expect(sliderStyles.marginRight).toBe('0px');
    expect(sliderStyles.paddingLeft).toBe('0px');
    expect(sliderStyles.paddingRight).toBe('0px');
    
    // Check if images are full width
    const image = page.locator('.amfm-drawer-photo-slide img').first();
    const imageBounds = await image.boundingBox();
    const sliderBounds = await photoSlider.boundingBox();
    
    expect(imageBounds.width).toBeCloseTo(sliderBounds.width, 2);
  });

  test('drawer content should not have padding affecting image slider', async ({ page }) => {
    // Create test content with images
    await page.evaluate(() => {
      const testContent = `
        <div class="amfm-drawer-location">
          <div class="amfm-drawer-photo-slider owl-carousel">
            <div class="amfm-drawer-photo-slide">
              <img src="https://via.placeholder.com/400x240/007cba/ffffff?text=Edge+Test" alt="Test photo" loading="lazy">
            </div>
          </div>
          <div class="amfm-drawer-header">
            <h2 class="amfm-drawer-title">Test Location</h2>
          </div>
        </div>
      `;
      
      const mapContainer = document.querySelector('.test-container');
      if (window.openDrawer) {
        window.openDrawer(testContent, mapContainer);
      }
    });
    
    await page.waitForTimeout(500);
    
    const drawer = page.locator('.amfm-drawer.open');
    const photoSlider = page.locator('.amfm-drawer-photo-slider');
    
    // Check if photo slider extends to drawer edges
    const drawerBounds = await drawer.boundingBox();
    const sliderBounds = await photoSlider.boundingBox();
    
    // Slider should start at the same x position as drawer (accounting for border)
    expect(sliderBounds.x).toBeCloseTo(drawerBounds.x, 5);
    expect(sliderBounds.width).toBeCloseTo(drawerBounds.width, 5);
  });

  test('drawer animation should work smoothly', async ({ page }) => {
    const mapContainer = page.locator('.test-container');
    
    // Ensure initial hidden state
    let drawer = page.locator('.amfm-drawer');
    if (await drawer.count() > 0) {
      const initialTransform = await drawer.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(initialTransform).toContain('translateY');
    }
    
    // Open drawer
    await page.locator('.test-pin').click();
    await page.waitForTimeout(100);
    
    // Check animation is in progress or completed
    drawer = page.locator('.amfm-drawer.open');
    await expect(drawer).toBeVisible();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    const finalTransform = await drawer.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Should be at position 0 (translateY(0px)) when open
    expect(finalTransform).toMatch(/(translateY\(0px\)|matrix\(1, 0, 0, 1, 0, 0\)|none)/);
  });

  test('visual integration test', async ({ page }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1000, height: 700 });
    
    // Take screenshot of initial state
    await expect(page.locator('.test-container')).toHaveScreenshot('drawer-closed-state.png', {
      threshold: 0.2
    });
    
    // Open drawer with image content
    await page.evaluate(() => {
      const testContent = `
        <div class="amfm-drawer-location">
          <div class="amfm-drawer-photo-slider owl-carousel">
            <div class="amfm-drawer-photo-slide">
              <img src="https://via.placeholder.com/400x240/007cba/ffffff?text=Visual+Test+1" alt="Test photo" loading="lazy">
            </div>
            <div class="amfm-drawer-photo-slide">
              <img src="https://via.placeholder.com/400x240/cc8f2c/ffffff?text=Visual+Test+2" alt="Test photo" loading="lazy">
            </div>
          </div>
          <div class="amfm-drawer-header">
            <h2 class="amfm-drawer-title">Visual Test Location</h2>
          </div>
          <div class="amfm-drawer-details">
            <div class="amfm-drawer-address">
              <span class="amfm-drawer-address-text">123 Visual Test Street</span>
            </div>
          </div>
        </div>
      `;
      
      const mapContainer = document.querySelector('.test-container');
      if (window.openDrawer) {
        window.openDrawer(testContent, mapContainer);
      }
    });
    
    await page.waitForTimeout(1000); // Wait for animation and carousel
    
    // Take screenshot of open state
    await expect(page.locator('.test-container')).toHaveScreenshot('drawer-open-edge-to-edge.png', {
      threshold: 0.2
    });
  });
});
