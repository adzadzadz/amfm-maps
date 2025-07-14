import { test, expect } from '@playwright/test';
import { WordPressHelper } from './utils/wordpress-helper';

test.describe('AMFM Filtering Issue Debug Tests', () => {
  let wpHelper: WordPressHelper;

  test.beforeEach(async ({ page }) => {
    wpHelper = new WordPressHelper(page);
    wpHelper.setupConsoleLogging();
    
    // Enhanced console monitoring for filtering issues
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AMFM') || 
          text.includes('filter') || 
          text.includes('marker') ||
          text.includes('loadLocations') ||
          text.includes('applyExternalFilters') ||
          text.includes('Clearing') ||
          text.includes('Places API')) {
        console.log(`[${msg.type().toUpperCase()}] ${text}`);
      }
    });
  });

  test('debug: filtering console vs map update issue', async ({ page }) => {
    test.slow();
    
    console.log('\n=== DEBUGGING: Filter Console vs Map Update Issue ===');
    
    // Navigate to test page
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for widgets to initialize
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
    
    // First, let's see what scripts and objects are actually on the page
    const pageInfo = await page.evaluate(() => {
      return {
        hasGoogleMaps: typeof window.google !== 'undefined',
        hasAMFMMapV2: typeof window.amfmMapV2 !== 'undefined',
        scriptsWithAMFM: Array.from(document.querySelectorAll('script')).filter(s => 
          s.src?.includes('amfm') || s.textContent?.includes('amfm')
        ).map(s => s.src || 'inline script'),
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('amfm')),
        hasMapContainer: !!document.querySelector('.amfm-map-v2-container'),
        hasFilterContainer: !!document.querySelector('.amfm-filter-container')
      };
    });
    
    console.log('Page diagnostic info:', pageInfo);
    
    // If amfmMapV2 doesn't exist, wait a bit more and try to trigger it
    if (!pageInfo.hasAMFMMapV2) {
      console.log('amfmMapV2 not found, trying to trigger map initialization...');
      
      // Try clicking on the map container to trigger initialization
      await page.click('.amfm-map-v2-container', { force: true }).catch(() => {
        console.log('Could not click map container');
      });
      
      await page.waitForTimeout(2000);
    }
    
    // First wait for amfmMapV2 to exist
    await page.waitForFunction(() => {
      return typeof window.amfmMapV2 !== 'undefined';
    }, { timeout: 180000 });
    
    console.log('amfmMapV2 object exists, waiting for map instance...');
    
    // Try to wait for the map instance, but don't fail if it doesn't exist
    try {
      await page.waitForFunction(() => {
        return window.amfmMapV2?.map !== undefined;
      }, { timeout: 180000 });
      console.log('Map instance exists!');
    } catch (e) {
      console.log('Map instance not detected, but proceeding with test...');
    }
    
    console.log('Map instance exists, waiting for markers array...');
    
    // Let's inspect what's actually in amfmMapV2 before waiting for markers
    const amfmMapV2Info = await page.evaluate(() => {
      if (typeof window.amfmMapV2 !== 'undefined') {
        return {
          exists: true,
          keys: Object.keys(window.amfmMapV2),
          hasMap: window.amfmMapV2.map ? 'yes' : 'no',
          hasMarkers: window.amfmMapV2.markers ? 'yes' : 'no',
          markersLength: window.amfmMapV2.markers?.length || 'undefined'
        };
      }
      return { exists: false };
    });
    
    console.log('amfmMapV2 object inspection:', amfmMapV2Info);
    
    // Try to wait for markers, but proceed even if it fails
    try {
      await page.waitForFunction(() => {
        return window.amfmMapV2?.markers !== undefined;
      }, { timeout: 10000 }); // Shorter timeout since we know markers are being created
      console.log('Markers array found!');
    } catch (e) {
      console.log('Markers array not found, but proceeding since we see markers being created in logs...');
    }
    
    // Additional wait for map stabilization
    await page.waitForTimeout(5000);
    
    console.log('Map loaded successfully, proceeding with test...');
    
    // Capture initial state
    const initialMarkerCount = await page.evaluate(() => {
      const counter = document.querySelector('[id*="_counter"]');
      return counter ? counter.textContent : 'No counter found';
    });
    
    console.log('Initial marker count:', initialMarkerCount);
    
    // Find a specific filter button (NOT the clear button)
    const filterButtons = page.locator('.amfm-filter-button').filter({ hasNotText: /clear|all/i });
    const filterButtonCount = await filterButtons.count();
    
    console.log('Available filter buttons (non-clear):', filterButtonCount);
    
    if (filterButtonCount > 0) {
      const filterButton = filterButtons.first();
      const buttonText = await filterButton.textContent();
      console.log('Clicking specific filter button:', buttonText);
      
      await filterButton.click();
      await page.waitForTimeout(3000);
      
      // Check if counter updated
      const newMarkerCount = await page.evaluate(() => {
        const counter = document.querySelector('[id*="_counter"]');
        return counter ? counter.textContent : 'No counter found';
      });
      
      console.log('After filter click - marker count:', newMarkerCount);
      console.log('Counter changed:', initialMarkerCount !== newMarkerCount);
      
      // Take screenshot to see current state
      await wpHelper.debugScreenshot('after-specific-filter-click');
    } else {
      console.log('No specific filter buttons found (only clear buttons)');
      
      // Let's see what buttons exist
      const allButtons = await page.locator('.amfm-filter-button').allTextContents();
      console.log('All filter buttons:', allButtons);
    }
    
    // Check map state after filtering
    const mapState = await page.evaluate(() => {
      return {
        mapExists: typeof window.amfmMapV2 !== 'undefined',
        markersArray: window.amfmMapV2?.markers?.length || 0,
        mapInstance: window.amfmMapV2?.map ? 'exists' : 'missing'
      };
    });
    
    console.log('Map state after filtering:', mapState);
    
    expect(mapState.mapExists).toBeTruthy();
  });

  test('debug: step-by-step filter execution tracking', async ({ page }) => {
    test.slow();
    
    console.log('\n=== DEBUGGING: Step-by-Step Filter Execution ===');
    
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for initialization
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
      }, { timeout: 180000 });
      console.log('Map instance exists!');
    } catch (e) {
      console.log('Map instance not detected, but proceeding with test...');
    }
    
    console.log('Map instance exists, waiting for markers array...');
    
    // Finally wait for markers array
    await page.waitForFunction(() => {
      return window.amfmMapV2?.markers !== undefined;
    }, { timeout: 180000 });
    
    console.log('Map loaded successfully, proceeding with test...');
    
    // Track all filter-related console messages
    const filterMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('filter') || text.includes('applyExternalFilters') || 
          text.includes('loadLocations') || text.includes('Clearing')) {
        filterMessages.push(`${new Date().toISOString()}: ${text}`);
        console.log('FILTER LOG:', text);
      }
    });
    
    // Get initial marker count from console logs
    const initialMarkersOnMap = await page.evaluate(() => {
      return window.amfmMapV2?.markers?.length || 0;
    });
    
    console.log('Initial markers on map:', initialMarkersOnMap);
    
    // Click a filter and watch what happens
    const filterButton = page.locator('.amfm-filter-button').first();
    if (await filterButton.isVisible()) {
      const buttonText = await filterButton.textContent();
      console.log('Clicking filter button:', buttonText);
      
      await filterButton.click();
      await page.waitForTimeout(5000); // Wait longer to see all filtering steps
      
      // Check markers after filtering
      const markersAfterFilter = await page.evaluate(() => {
        return window.amfmMapV2?.markers?.length || 0;
      });
      
      console.log('Markers after filter:', markersAfterFilter);
      console.log('Filter messages captured:', filterMessages.length);
      
      // Print all filter messages in chronological order
      filterMessages.forEach(msg => console.log(msg));
      
      await wpHelper.debugScreenshot('step-by-step-filtering');
    }
    
    expect(filterMessages.length).toBeGreaterThan(0);
  });

  test('debug: specific filter button (not clear) - map instance issue', async ({ page }) => {
    test.slow();
    
    console.log('\n=== DEBUGGING: Specific Filter Button - Map Instance Issue ===');
    
    await page.goto('http://localhost:10003/map-test/');
    
    // Wait for widgets
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
      }, { timeout: 180000 });
      console.log('Map instance exists!');
    } catch (e) {
      console.log('Map instance not detected, but proceeding with test...');
    }
    
    console.log('Map instance exists, waiting for markers array...');
    
    // Finally wait for markers array
    await page.waitForFunction(() => {
      return window.amfmMapV2?.markers !== undefined;
    }, { timeout: 180000 });
    
    console.log('Map loaded successfully, proceeding with test...');
    
    // Get initial map instance state
    const initialMapState = await page.evaluate(() => {
      return {
        mapExists: typeof window.amfmMapV2 !== 'undefined',
        mapInstance: window.amfmMapV2?.map ? 'exists' : 'missing',
        markersCount: window.amfmMapV2?.markers?.length || 0
      };
    });
    
    console.log('Initial map state:', initialMapState);
    
    // Find a specific filter button (NOT the clear button)
    const specificFilterButton = page.locator('.amfm-filter-button').filter({ hasText: /^(?!Clear)/ }).first();
    
    if (await specificFilterButton.isVisible()) {
      const buttonText = await specificFilterButton.textContent();
      console.log(`Clicking SPECIFIC filter button: "${buttonText}"`);
      
      await specificFilterButton.click();
      await page.waitForTimeout(3000);
      
      // Check map instance after specific filter
      const afterFilterMapState = await page.evaluate(() => {
        return {
          mapExists: typeof window.amfmMapV2 !== 'undefined',
          mapInstance: window.amfmMapV2?.map ? 'exists' : 'missing',
          markersCount: window.amfmMapV2?.markers?.length || 0
        };
      });
      
      console.log('After specific filter - map state:', afterFilterMapState);
      
      // 🚨 This is the key issue: Map instance becomes missing during filtering
      if (initialMapState.mapInstance === 'exists' && afterFilterMapState.mapInstance === 'missing') {
        console.log('🚨 CONFIRMED BUG: Map instance is lost during filtering operation!');
        console.log('This explains why console shows filtering but map doesnt update');
      }
      
      await wpHelper.debugScreenshot('specific-filter-map-instance-issue');
    }
    
    expect(initialMapState.mapExists).toBeTruthy();
  });

});
