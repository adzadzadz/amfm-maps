import { chromium, FullConfig } from '@playwright/test';
import { WordPressHelper } from './utils/wordpress-helper';
import { TestPageHelper } from './utils/test-page-helper';

/**
 * Global setup for AMFM Maps tests
 * Creates test pages and prepares test environment
 */
async function globalSetup(config: FullConfig) {
  console.log('Starting global setup for AMFM Maps tests...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    const wpHelper = new WordPressHelper(page);
    const testHelper = new TestPageHelper(page, wpHelper);
    
    // Create all test pages
    const pageIds = await testHelper.createAllTestPages();
    
    // Store page IDs for tests to use
    process.env.TEST_MAP_PAGE_ID = pageIds.mapOnly;
    process.env.TEST_FILTER_PAGE_ID = pageIds.filterButtons;
    process.env.TEST_FILTER_SIDEBAR_PAGE_ID = pageIds.filterSidebar;
    process.env.TEST_COMPLETE_PAGE_ID = pageIds.complete;
    
    // Create direct URLs for easy access
    const baseUrl = config.projects[0].use?.baseURL || 'http://localhost';
    process.env.TEST_MAP_PAGE_URL = `${baseUrl}/?page_id=${pageIds.mapOnly}`;
    process.env.TEST_FILTER_PAGE_URL = `${baseUrl}/?page_id=${pageIds.filterButtons}`;
    process.env.TEST_FILTER_SIDEBAR_PAGE_URL = `${baseUrl}/?page_id=${pageIds.filterSidebar}`;
    process.env.TEST_COMPLETE_PAGE_URL = `${baseUrl}/?page_id=${pageIds.complete}`;
    
    console.log('Test page URLs:', {
      map: process.env.TEST_MAP_PAGE_URL,
      filter: process.env.TEST_FILTER_PAGE_URL,
      filterSidebar: process.env.TEST_FILTER_SIDEBAR_PAGE_URL,
      complete: process.env.TEST_COMPLETE_PAGE_URL
    });
    
    console.log('Global setup completed successfully');
    
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
