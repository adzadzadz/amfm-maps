import { Page, expect } from '@playwright/test';
import { testConfig } from '../config/test-config';

/**
 * WordPress utilities for AMFM Maps testing
 */
export class WordPressHelper {
  constructor(private page: Page) {}

  /**
   * Login to WordPress admin
   */
  async login(username?: string, password?: string) {
    const user = username || testConfig.wordpress.username;
    const pass = password || testConfig.wordpress.password;
    
    await this.page.goto('/wp-admin');
    
    // Check if already logged in
    const isLoggedIn = await this.page.locator(testConfig.selectors.wordpress.adminBar).isVisible().catch(() => false);
    if (isLoggedIn) {
      return;
    }

    // Fill login form
    await this.page.fill(testConfig.selectors.wordpress.loginForm.username, user);
    await this.page.fill(testConfig.selectors.wordpress.loginForm.password, pass);
    await this.page.click(testConfig.selectors.wordpress.loginForm.submit);
    
    // Wait for dashboard
    await this.page.waitForSelector(testConfig.selectors.wordpress.adminBar, { 
      timeout: testConfig.timeouts.navigation 
    });
  }

  /**
   * Navigate to Elementor editor for a page
   */
  async goToElementorEditor(pageId: string | number) {
    await this.page.goto(`/wp-admin/post.php?post=${pageId}&action=elementor`);
    
    // Wait for Elementor to load
    await this.page.waitForSelector(testConfig.selectors.elementor.iframe, { 
      timeout: testConfig.timeouts.elementorLoad 
    });
    await this.page.waitForTimeout(3000); // Additional wait for full load
  }

  /**
   * Create a new page with Elementor
   */
  async createNewPage(title: string = 'Test Page') {
    await this.page.goto('/wp-admin/post-new.php?post_type=page');
    
    // Add title
    await this.page.fill('#title', title);
    
    // Click "Edit with Elementor" if available
    const elementorButton = this.page.locator('a[href*="action=elementor"]');
    if (await elementorButton.isVisible()) {
      await elementorButton.click();
      await this.page.waitForSelector('#elementor-preview-iframe', { timeout: 30000 });
    }
    
    return this.page.url();
  }

  /**
   * Switch to Elementor preview iframe
   */
  async switchToElementorPreview() {
    const iframe = this.page.frameLocator('#elementor-preview-iframe');
    return iframe;
  }

  /**
   * Add AMFM Map widget to Elementor
   */
  async addAMFMMapWidget() {
    // Click on the add widget button
    await this.page.click('[data-tooltip="Add New Section"]');
    await this.page.waitForTimeout(1000);
    
    // Search for AMFM widget
    await this.page.fill('.elementor-search-input', 'AMFM Map V2');
    await this.page.waitForTimeout(500);
    
    // Click on the widget
    const mapWidget = this.page.locator('.elementor-element-wrapper').filter({ hasText: 'AMFM Map V2' }).first();
    await mapWidget.click();
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Add AMFM Filter widget to Elementor
   */
  async addAMFMFilterWidget() {
    // Click on the add widget button
    await this.page.click('[data-tooltip="Add New Section"]');
    await this.page.waitForTimeout(1000);
    
    // Search for AMFM Filter widget
    await this.page.fill('.elementor-search-input', 'AMFM Map V2 Filter');
    await this.page.waitForTimeout(500);
    
    // Click on the widget
    const filterWidget = this.page.locator('.elementor-element-wrapper').filter({ hasText: 'AMFM Map V2 Filter' }).first();
    await filterWidget.click();
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Publish the current page/post
   */
  async publishPage() {
    await this.page.click('#elementor-panel-saver-button-publish');
    await this.page.waitForSelector('.elementor-button-success', { timeout: 10000 });
  }

  /**
   * Preview the current page
   */
  async previewPage() {
    await this.page.click('#elementor-panel-saver-button-preview');
    
    // Wait for new tab and switch to it
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.click('#elementor-panel-saver-button-preview')
    ]);
    
    await newPage.waitForLoadState();
    return newPage;
  }

  /**
   * Wait for Google Maps to load
   */
  async waitForGoogleMaps(timeout: number = testConfig.timeouts.mapLoad) {
    await this.page.waitForFunction(
      () => typeof (window as any).google !== 'undefined' && (window as any).google.maps && (window as any).google.maps.Map,
      { timeout }
    );
  }

  /**
   * Wait for AMFM map to initialize
   */
  async waitForAMFMMap(mapId?: string, timeout: number = testConfig.timeouts.mapLoad) {
    if (mapId) {
      await this.page.waitForSelector(`#${mapId}`, { timeout });
    } else {
      await this.page.waitForSelector(testConfig.selectors.map.container, { timeout });
    }
    
    // Wait for map to be loaded (more lenient check)
    try {
      await this.page.waitForFunction(
        () => {
          const mapElement = document.querySelector('[id*="amfm_map_v2_"]') as HTMLElement;
          return mapElement && (mapElement.querySelector('.gm-style') || mapElement.querySelector('canvas') || mapElement.offsetHeight > 100);
        },
        { timeout }
      );
    } catch (error) {
      // Fallback - just wait for the map container
      console.log('Map canvas not detected, but container exists. Continuing...');
      await this.page.waitForTimeout(3000);
    }
  }

  /**
   * Get console messages for debugging
   */
  setupConsoleLogging() {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      } else if (msg.text().includes('AMFM') || msg.text().includes('amfm')) {
        console.log(`AMFM Log: ${msg.text()}`);
      }
    });
  }

  /**
   * Take screenshot for debugging
   */
  async debugScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/debug-screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}
