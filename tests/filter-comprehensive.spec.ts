import { test, expect } from '@playwright/test';
import { WordPressHelper } from './utils/wordpress-helper';

declare global {
    interface Window {
        amfmMap: any;
        testLogs: any[];
        setupFilterListenersCalled: boolean;
        eventListenerSetupLogs: any[];
        amfmConsoleLogs: string[];
    }
}

test.describe('AMFM Filter Comprehensive Tests', () => {
    let wpHelper: WordPressHelper;
    
    test.beforeEach(async ({ page }) => {
        wpHelper = new WordPressHelper(page);
        wpHelper.setupConsoleLogging();
        
        // Navigate to test page
        await page.goto('http://localhost:10003/map-test/');
        
        // Wait for initial map load
        await page.waitForSelector('#amfm_map_8f74753', { timeout: 30000 });
        await page.waitForFunction(() => window.amfmMap && window.amfmMap.markers, { timeout: 30000 });
    });

    test('comprehensive filter testing for all categories', async ({ page }) => {
        console.log('=== COMPREHENSIVE FILTER TESTING ===');
        
        // Wait for map to be fully loaded (adjust expected count based on actual data)
        await page.waitForFunction(() => {
            return window.amfmMap && 
                   window.amfmMap.markers && 
                   Object.keys(window.amfmMap.markers).length > 0 &&
                   window.amfmMap.markers[Object.keys(window.amfmMap.markers)[0]] &&
                   window.amfmMap.markers[Object.keys(window.amfmMap.markers)[0]].length >= 15; // Adjusted to actual count
        }, { timeout: 30000 });

        // Get initial count
        const initialCount = await page.locator('#amfm_map_8f74753_counter').textContent();
        console.log('Initial marker count:', initialCount);

        // Test each filter category
        const filterCategories = [
            { name: 'Location', prefix: 'location', firstButton: 'California' },
            { name: 'Gender', prefix: 'gender', firstButton: 'Male' },
            { name: 'Conditions', prefix: 'conditions', firstButton: 'Depression' },
            { name: 'Programs', prefix: 'programs', firstButton: 'Adult Program' },
            { name: 'Accommodations', prefix: 'accommodations', firstButton: 'Pet Friendly' }
        ];

        for (const category of filterCategories) {
            console.log(`\n--- Testing ${category.name} Filter ---`);
            
            // Find the first button in this category
            const categoryButtons = await page.locator(`[data-filter-type="${category.prefix}"]`).all();
            console.log(`Found ${categoryButtons.length} buttons for ${category.name}`);
            
            if (categoryButtons.length > 0) {
                const firstButton = categoryButtons[0];
                const buttonText = await firstButton.textContent();
                const filterValue = await firstButton.getAttribute('data-filter-value');
                
                console.log(`Clicking first ${category.name} button: "${buttonText}" (value: ${filterValue})`);
                
                // Clear any existing filters first
                const clearButton = page.locator('.amfm-clear-filters');
                if (await clearButton.isVisible()) {
                    await clearButton.click();
                    await page.waitForTimeout(1000);
                }
                
                // Click the filter button
                await firstButton.click();
                await page.waitForTimeout(2000);
                
                // Check if button is active
                const isActive = await firstButton.evaluate(el => el.classList.contains('active'));
                console.log(`Button active state: ${isActive}`);
                
                // Get updated count
                const updatedCount = await page.locator('#amfm_map_8f74753_counter').textContent();
                console.log(`Count after ${category.name} filter: ${updatedCount}`);
                
                // Check if count changed
                const countChanged = updatedCount !== initialCount;
                console.log(`Count changed: ${countChanged}`);
                
                // Log console messages during filter click
                const consoleMessages = await page.evaluate(() => {
                    return window.testLogs || [];
                });
                
                if (consoleMessages.length > 0) {
                    console.log('Console messages:', consoleMessages.slice(-5)); // Last 5 messages
                }
                
                // Test expectation
                if (countChanged) {
                    console.log(`✅ ${category.name} filter working - count changed from ${initialCount} to ${updatedCount}`);
                } else {
                    console.log(`❌ ${category.name} filter NOT working - count remained ${initialCount}`);
                }
                
                // Clear filter for next test
                if (await clearButton.isVisible()) {
                    await clearButton.click();
                    await page.waitForTimeout(1000);
                }
            } else {
                console.log(`❌ No buttons found for ${category.name} filter`);
            }
        }
        
        // Diagnostic information
        console.log('\n--- DIAGNOSTIC INFORMATION ---');
        
        const diagnostics = await page.evaluate(() => {
            const container = document.getElementById('amfm_map_8f74753');
            const hasEventListener = container && (container as any)._events && (container as any)._events.amfmFilterUpdate;
            
            return {
                containerExists: !!container,
                containerClasses: container ? Array.from(container.classList) : [],
                hasEventListener: !!hasEventListener,
                amfmMapKeys: window.amfmMap ? Object.keys(window.amfmMap) : [],
                instancesKeys: window.amfmMap && window.amfmMap.instances ? Object.keys(window.amfmMap.instances) : [],
                markersKeys: window.amfmMap && window.amfmMap.markers ? Object.keys(window.amfmMap.markers) : []
            };
        });
        
        console.log('Container diagnostics:', diagnostics);
        
        // Check for event listener setup logs
        const setupLogs = await page.evaluate(() => {
            return window.setupFilterListenersCalled || false;
        });
        console.log('Setup filter listeners called:', setupLogs);
    });

    test('test direct event dispatch', async ({ page }) => {
        console.log('=== TESTING DIRECT EVENT DISPATCH ===');
        
        // Wait for map to load
        await page.waitForFunction(() => window.amfmMap && window.amfmMap.markers, { timeout: 30000 });
        
        // Get initial count
        const initialCount = await page.locator('#amfm_map_8f74753_counter').textContent();
        console.log('Initial count:', initialCount);
        
        // Manually dispatch filter event
        const result = await page.evaluate(() => {
            const container = document.getElementById('amfm_map_8f74753');
            if (!container) {
                return { error: 'Container not found' };
            }
            
            // Create and dispatch custom event
            const filterEvent = new CustomEvent('amfmFilterUpdate', {
                detail: {
                    filters: {
                        location: ['California'],
                        gender: [],
                        conditions: [],
                        programs: [],
                        accommodations: []
                    }
                }
            });
            
            console.log('🧪 Manually dispatching event to:', container.id);
            container.dispatchEvent(filterEvent);
            
            return { success: true, containerId: container.id };
        });
        
        console.log('Direct dispatch result:', result);
        
        // Wait and check count
        await page.waitForTimeout(2000);
        const updatedCount = await page.locator('#amfm_map_8f74753_counter').textContent();
        console.log('Count after direct dispatch:', updatedCount);
        
        const changed = updatedCount !== initialCount;
        console.log('Direct dispatch worked:', changed);
    });

    test('debug event listener setup', async ({ page }) => {
        console.log('=== DEBUGGING EVENT LISTENER SETUP ===');
        
        // Add debugging to track event listener setup
        await page.addInitScript(() => {
            window.setupFilterListenersCalled = false;
            window.eventListenerSetupLogs = [];
            
            // Override addEventListener to track when listeners are added
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'amfmFilterUpdate') {
                    window.eventListenerSetupLogs.push({
                        element: this.id || this.tagName,
                        type: type,
                        timestamp: Date.now()
                    });
                    console.log('🎧 Event listener added for', type, 'on', this.id || this.tagName);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
        });
        
        await page.goto('http://localhost:10003/map-test/');
        
        // Wait for everything to load
        await page.waitForSelector('#amfm_map_8f74753', { timeout: 30000 });
        await page.waitForFunction(() => window.amfmMap, { timeout: 30000 });
        await page.waitForTimeout(5000); // Give extra time for setup
        
        // Check setup logs
        const setupInfo = await page.evaluate(() => {
            return {
                setupCalled: window.setupFilterListenersCalled,
                eventListenerLogs: window.eventListenerSetupLogs,
                containerExists: !!document.getElementById('amfm_map_8f74753'),
                amfmMapExists: !!window.amfmMap
            };
        });
        
        console.log('Event listener setup information:', setupInfo);
        
        // Check if we can find the setup function in console logs
        const consoleMessages = await page.evaluate(() => {
            return window.amfmConsoleLogs || [];
        });
        
        console.log('Console messages related to setup:', 
            consoleMessages.filter(msg => msg.includes('Setting up filter listeners')));
    });
});
