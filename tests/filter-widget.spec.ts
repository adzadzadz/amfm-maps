import { test, expect } from '@playwright/test';
import { WordPressHelper } from './utils/wordpress-helper';

test.describe('AMFM Filter Widget - Debugging Filter Issue', () => {
  let wpHelper: WordPressHelper;

  test.beforeEach(async ({ page }) => {
    wpHelper = new WordPressHelper(page);
    wpHelper.setupConsoleLogging();
    
    // Monitor console specifically for filtering issues
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('filter') || text.includes('applyExternalFilters') || 
          text.includes('loadLocations') || text.includes('Clearing') ||
          text.includes('marker')) {
        console.log(`[FILTER DEBUG] ${msg.type()}: ${text}`);
      }
    });
  });

  test('debug: filter button click triggers console but map doesnt update', async ({ page }) => {
    test.slow();
    
    console.log('\n=== DEBUGGING: Filter Console vs Map Update ===');
    
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for both widgets to load
    await page.waitForSelector('.amfm-filter-container', { timeout: 15000 });
    await page.waitForSelector('.amfm-map-v2-container', { timeout: 15000 });
    
    console.log('Triggering initial page interaction to activate maps...');
    
    // Add random scroll action to trigger map loading
    await page.evaluate(() => {
      window.scrollTo(0, 100);
    });
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
    
    // Wait for map to fully load with extended timeout (3 minutes)
    console.log('Waiting for map to fully load...');
    
    // First wait for amfmMapV2 to exist
    await page.waitForFunction(() => {
      return typeof window.amfmMapV2 !== 'undefined';
    }, { timeout: 180000 });
    
    console.log('amfmMapV2 object exists, waiting for map instance...');
    
    // Try to wait for the map instance, but don't fail if it doesn't exist
    try {
      await page.waitForFunction(() => {
        return window.amfmMapV2?.map !== undefined;
      }, { timeout: 180000 }); // Full 3 minute timeout
      console.log('Map instance exists!');
    } catch (e) {
      console.log('Map instance not detected, but proceeding with test...');
    }
    
    console.log('Waiting for markers array...');
    
    // Wait for markers array (this seems to work)
    await page.waitForFunction(() => {
      return window.amfmMapV2?.markers !== undefined;
    }, { timeout: 180000 });
    
    // Additional wait for map stabilization
    await page.waitForTimeout(5000);
    
    console.log('Map loaded successfully, proceeding with test...');
    
    // Track console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('filter') || text.includes('loadLocations') || 
          text.includes('applyExternalFilters') || text.includes('Clearing')) {
        consoleMessages.push(text);
        console.log('CAPTURED:', text);
      }
    });
    
    // Get initial state
    const initialState = await page.evaluate(() => {
      const counter = document.querySelector('[id*="_counter"]');
      return {
        counterText: counter?.textContent || 'No counter',
        mapExists: typeof window.amfmMapV2 !== 'undefined',
        markersCount: window.amfmMapV2?.markers?.length || 0
      };
    });
    
    console.log('Initial state:', initialState);
    
    // Find and click first filter button
    const filterButton = page.locator('.amfm-filter-button').first();
    if (await filterButton.isVisible()) {
      const buttonText = await filterButton.textContent();
      console.log(`Clicking filter button: "${buttonText}"`);
      
      await filterButton.click();
      await page.waitForTimeout(3000);
      
      // Check state after filter
      const afterFilterState = await page.evaluate(() => {
        const counter = document.querySelector('[id*="_counter"]');
        return {
          counterText: counter?.textContent || 'No counter',
          markersCount: window.amfmMapV2?.markers?.length || 0
        };
      });
      
      console.log('After filter state:', afterFilterState);
      console.log('Console messages captured:', consoleMessages.length);
      consoleMessages.forEach(msg => console.log('  -', msg));
      
      // The key debugging info: Are console messages showing filtering but map not updating?
      const hasFilteringMessages = consoleMessages.some(msg => 
        msg.includes('loadLocations') || msg.includes('applyExternalFilters')
      );
      
      console.log('Has filtering console messages:', hasFilteringMessages);
      console.log('Counter changed:', initialState.counterText !== afterFilterState.counterText);
      console.log('Markers count changed:', initialState.markersCount !== afterFilterState.markersCount);
      
      await wpHelper.debugScreenshot('filter-debug-after-click');
      
      // This is the core issue: Console shows filtering but map doesn't update
      if (hasFilteringMessages && initialState.counterText === afterFilterState.counterText) {
        console.log('🚨 ISSUE CONFIRMED: Console shows filtering but counter/map not updated!');
      }
    } else {
      console.log('No filter buttons found');
    }
    
    expect(consoleMessages.length).toBeGreaterThan(0);
  });

});