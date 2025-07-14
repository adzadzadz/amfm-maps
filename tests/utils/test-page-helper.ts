import { Page } from '@playwright/test';
import { WordPressHelper } from './wordpress-helper';

/**
 * Test page setup utilities for AMFM Maps testing
 */
export class TestPageHelper {
  constructor(private page: Page, private wpHelper: WordPressHelper) {}

  /**
   * Create a test page with map widget only
   */
  async createMapOnlyPage(title: string = 'Test Map Page'): Promise<string> {
    await this.wpHelper.login();
    
    // Create new page
    await this.page.goto('/wp-admin/post-new.php?post_type=page');
    await this.page.fill('#title', title);
    
    // Save as draft first
    await this.page.click('#save-post');
    await this.page.waitForSelector('.notice-success', { timeout: 10000 });
    
    // Get page ID from URL
    const url = this.page.url();
    const pageIdMatch = url.match(/post=(\d+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : '';
    
    // Edit with Elementor
    await this.wpHelper.goToElementorEditor(pageId);
    
    // Add map widget
    await this.addMapWidget();
    
    // Publish
    await this.wpHelper.publishPage();
    
    return pageId;
  }

  /**
   * Create a test page with filter widget only
   */
  async createFilterOnlyPage(title: string = 'Test Filter Page', layout: 'buttons' | 'sidebar' = 'buttons'): Promise<string> {
    await this.wpHelper.login();
    
    // Create new page
    await this.page.goto('/wp-admin/post-new.php?post_type=page');
    await this.page.fill('#title', title);
    
    // Save as draft first
    await this.page.click('#save-post');
    await this.page.waitForSelector('.notice-success', { timeout: 10000 });
    
    // Get page ID
    const url = this.page.url();
    const pageIdMatch = url.match(/post=(\d+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : '';
    
    // Edit with Elementor
    await this.wpHelper.goToElementorEditor(pageId);
    
    // Add filter widget
    await this.addFilterWidget(layout);
    
    // Publish
    await this.wpHelper.publishPage();
    
    return pageId;
  }

  /**
   * Create a complete test page with both map and filter widgets
   */
  async createCompletePage(title: string = 'Test Complete Page'): Promise<string> {
    await this.wpHelper.login();
    
    // Create new page
    await this.page.goto('/wp-admin/post-new.php?post_type=page');
    await this.page.fill('#title', title);
    
    // Save as draft first
    await this.page.click('#save-post');
    await this.page.waitForSelector('.notice-success', { timeout: 10000 });
    
    // Get page ID
    const url = this.page.url();
    const pageIdMatch = url.match(/post=(\d+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : '';
    
    // Edit with Elementor
    await this.wpHelper.goToElementorEditor(pageId);
    
    // Add filter widget first (top of page)
    await this.addFilterWidget('buttons');
    
    // Add map widget below filter
    await this.addMapWidget();
    
    // Publish
    await this.wpHelper.publishPage();
    
    return pageId;
  }

  /**
   * Add map widget to current Elementor page
   */
  private async addMapWidget() {
    // Click Add New Section
    await this.page.click('[data-tooltip="Add New Section"]');
    await this.page.waitForTimeout(1000);
    
    // Choose single column layout
    await this.page.click('.elementor-preset:first-child');
    await this.page.waitForTimeout(1000);
    
    // Click Add Widget
    await this.page.click('.elementor-add-element-button');
    await this.page.waitForTimeout(1000);
    
    // Search for AMFM Map V2
    await this.page.fill('.elementor-search-input', 'AMFM Map V2');
    await this.page.waitForTimeout(500);
    
    // Click on the map widget (not filter)
    const mapWidget = this.page.locator('.elementor-element-wrapper').filter({ hasText: /^AMFM Map V2$/ });
    await mapWidget.click();
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Add filter widget to current Elementor page
   */
  private async addFilterWidget(layout: 'buttons' | 'sidebar' = 'buttons') {
    // Click Add New Section
    await this.page.click('[data-tooltip="Add New Section"]');
    await this.page.waitForTimeout(1000);
    
    // Choose single column layout
    await this.page.click('.elementor-preset:first-child');
    await this.page.waitForTimeout(1000);
    
    // Click Add Widget
    await this.page.click('.elementor-add-element-button');
    await this.page.waitForTimeout(1000);
    
    // Search for AMFM Filter
    await this.page.fill('.elementor-search-input', 'AMFM Map V2 Filter');
    await this.page.waitForTimeout(500);
    
    // Click on the filter widget
    const filterWidget = this.page.locator('.elementor-element-wrapper').filter({ hasText: 'AMFM Map V2 Filter' });
    await filterWidget.click();
    
    await this.page.waitForTimeout(2000);
    
    // Configure filter layout if needed
    if (layout === 'sidebar') {
      // Click on filter layout dropdown
      const layoutDropdown = this.page.locator('select[data-setting="filter_layout"]');
      if (await layoutDropdown.isVisible()) {
        await layoutDropdown.selectOption('sidebar');
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Setup test data in WordPress options
   */
  async setupTestData() {
    await this.wpHelper.login();
    
    // Navigate to WordPress admin and set up test data via database
    // This could be done through a custom admin page or direct database manipulation
    
    // For now, we'll assume the test data is already in the system
    // In a real scenario, you might want to:
    // 1. Create a custom admin endpoint for test data
    // 2. Use WordPress CLI commands
    // 3. Direct database operations
    
    console.log('Test data setup - assuming test data is already configured');
  }

  /**
   * Clean up test pages
   */
  async cleanupTestPages(pageIds: string[]) {
    await this.wpHelper.login();
    
    for (const pageId of pageIds) {
      try {
        // Move to trash
        await this.page.goto(`/wp-admin/post.php?post=${pageId}&action=trash`);
        await this.page.waitForTimeout(1000);
      } catch (error) {
        console.log(`Failed to cleanup page ${pageId}:`, error);
      }
    }
  }

  /**
   * Create test pages for all test scenarios
   */
  async createAllTestPages(): Promise<{ [key: string]: string }> {
    const pageIds: { [key: string]: string } = {};
    
    try {
      console.log('Creating test pages...');
      
      // Setup test data first
      await this.setupTestData();
      
      // Create map-only page
      pageIds.mapOnly = await this.createMapOnlyPage('Test Map Only');
      console.log('Created map-only page:', pageIds.mapOnly);
      
      // Create filter-only page (buttons)
      pageIds.filterButtons = await this.createFilterOnlyPage('Test Filter Buttons', 'buttons');
      console.log('Created filter buttons page:', pageIds.filterButtons);
      
      // Create filter-only page (sidebar)
      pageIds.filterSidebar = await this.createFilterOnlyPage('Test Filter Sidebar', 'sidebar');
      console.log('Created filter sidebar page:', pageIds.filterSidebar);
      
      // Create complete page
      pageIds.complete = await this.createCompletePage('Test Complete');
      console.log('Created complete page:', pageIds.complete);
      
      console.log('All test pages created successfully');
      
      return pageIds;
    } catch (error) {
      console.error('Failed to create test pages:', error);
      throw error;
    }
  }
}
