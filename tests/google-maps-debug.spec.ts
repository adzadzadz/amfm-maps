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

test.describe('AMFM Filter Debug - Google Maps Idle Event', () => {
    let wpHelper: WordPressHelper;
    
    test.beforeEach(async ({ page }) => {
        wpHelper = new WordPressHelper(page);
        wpHelper.setupConsoleLogging();
        
        // Navigate to test page
        await page.goto('http://localhost:10003/map-test/');
    });

    test('debug google maps idle event not firing', async ({ page }) => {
        console.log('=== DEBUGGING GOOGLE MAPS IDLE EVENT ===');
        
        // Wait for initial map load
        await page.waitForSelector('#amfm_map_8f74753', { timeout: 30000 });
        
        // Wait for map to be initialized
        await page.waitForFunction(() => window.amfmMap && window.amfmMap.maps, { timeout: 30000 });
        
        console.log('Map container and amfmMap loaded');
        
        // Check if map is initialized
        const mapStatus = await page.evaluate(() => {
            const mapId = 'amfm_map_8f74753';
            const mapInstance = window.amfmMap && window.amfmMap.maps && window.amfmMap.maps[mapId];
            
            return {
                amfmMapExists: !!window.amfmMap,
                mapsRegistryExists: !!window.amfmMap?.maps,
                mapInstanceExists: !!mapInstance,
                mapInstanceType: typeof mapInstance,
                googleMapsExists: !!(window as any).google?.maps,
                mapElementExists: !!document.getElementById(mapId + '_map')
            };
        });
        
        console.log('Map status:', mapStatus);
        
        // Add manual idle event listener to debug
        const idleEventResult = await page.evaluate(() => {
            const mapId = 'amfm_map_8f74753';
            const mapInstance = window.amfmMap?.maps?.[mapId];
            
            if (!mapInstance) {
                return { error: 'Map instance not found' };
            }
            
            return new Promise((resolve) => {
                let eventFired = false;
                
                // Add our own idle listener
                (window as any).google.maps.event.addListenerOnce(mapInstance, 'idle', function() {
                    eventFired = true;
                    console.log('🎯 MANUAL: Map idle event fired!');
                    resolve({ success: true, eventFired: true });
                });
                
                // Also listen for other events to see what's happening
                (window as any).google.maps.event.addListener(mapInstance, 'bounds_changed', function() {
                    console.log('🗺️ Map bounds_changed event fired');
                });
                
                (window as any).google.maps.event.addListener(mapInstance, 'center_changed', function() {
                    console.log('🎯 Map center_changed event fired');
                });
                
                (window as any).google.maps.event.addListener(mapInstance, 'zoom_changed', function() {
                    console.log('🔍 Map zoom_changed event fired');
                });
                
                // Set a timeout to resolve if idle never fires
                setTimeout(() => {
                    if (!eventFired) {
                        console.log('⏰ Timeout: Map idle event never fired after 10 seconds');
                        resolve({ success: false, eventFired: false, timeout: true });
                    }
                }, 10000);
            });
        });
        
        console.log('Idle event result:', idleEventResult);
        
        // Also check if we can manually trigger the callback
        console.log('Attempting to manually call the callback that should be in idle event...');
        
        const manualCallResult = await page.evaluate(() => {
            const mapId = 'amfm_map_8f74753';
            
            // Find the amfmMap.init settings for this map
            const settings = window.amfmMap?.instances?.[mapId];
            if (!settings) {
                return { error: 'Settings not found for map', mapId };
            }
            
            console.log('🔧 Found settings for map:', settings);
            
            // Try to manually execute the setupFilterListeners
            const setupFunction = (window as any).setupFilterListeners;
            if (typeof setupFunction === 'function') {
                console.log('📞 Manually calling setupFilterListeners...');
                setupFunction();
                return { success: true, manualCall: true };
            } else {
                return { error: 'setupFilterListeners function not found globally' };
            }
        });
        
        console.log('Manual call result:', manualCallResult);
        
        // Wait a bit more and check for any delayed events
        await page.waitForTimeout(5000);
        
        // Final status check
        const finalStatus = await page.evaluate(() => {
            const container = document.getElementById('amfm_map_8f74753');
            return {
                containerExists: !!container,
                hasEventListener: !!(container as any)?._events?.amfmFilterUpdate,
                markersLoaded: window.amfmMap?.markers?.['amfm_map_8f74753']?.length || 0
            };
        });
        
        console.log('Final status:', finalStatus);
    });
});
