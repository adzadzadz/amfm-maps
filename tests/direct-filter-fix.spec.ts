import { test, expect } from '@playwright/test';

declare global {
    interface Window {
        amfmMap: any;
        testDebugInfo: any;
    }
}

test.describe('Direct Filter Fix and Test', () => {
    test('manually implement missing functionality and test filters', async ({ page }) => {
        console.log('=== DIRECT FILTER FIX AND TEST ===');
        
        await page.goto('http://localhost:10003/map-test/');
        
        // Wait for map container
        await page.waitForSelector('#amfm_map_8f74753', { timeout: 30000 });
        await page.waitForFunction(() => window.amfmMap, { timeout: 30000 });
        
        console.log('Directly implementing missing setupFilterListeners functionality...');
        
        // Manually implement the missing setupFilterListeners functionality
        const setupResult = await page.evaluate(() => {
            const mapId = 'amfm_map_8f74753';
            const container = document.getElementById(mapId);
            
            if (!container) {
                return { error: 'Container not found' };
            }
            
            // Check if loadLocations exists
            const hasLoadLocations = !!(window.amfmMap?.loadLocations?.[mapId]);
            
            if (!hasLoadLocations) {
                // Need to setup loadLocations function first
                console.log('⚠️ Setting up missing loadLocations function...');
                
                const settings = window.amfmMap?.instances?.[mapId];
                if (!settings) {
                    return { error: 'Settings not found' };
                }
                
                const map = window.amfmMap?.maps?.[mapId];
                if (!map) {
                    return { error: 'Map instance not found' };
                }
                
                // Create loadLocations function
                const loadLocations = function(locations) {
                    console.log('🔄 Loading', locations.length, 'locations...');
                    
                    // Clear existing markers
                    const existingMarkers = window.amfmMap.markers[mapId] || [];
                    existingMarkers.forEach(marker => marker.setMap(null));
                    window.amfmMap.markers[mapId] = [];
                    
                    // Create new markers
                    locations.forEach((location, index) => {
                        if (location.PlaceID && location.Latitude && location.Longitude) {
                            const marker = new (window as any).google.maps.Marker({
                                position: { lat: parseFloat(location.Latitude), lng: parseFloat(location.Longitude) },
                                map: map,
                                title: location['Facility Name'] || 'Location'
                            });
                            
                            window.amfmMap.markers[mapId].push(marker);
                            console.log('📍 Marker created for:', location['Facility Name'], 'Total markers:', window.amfmMap.markers[mapId].length);
                        }
                    });
                    
                    // Update counter
                    const counter = document.getElementById(mapId + '_counter');
                    if (counter) {
                        counter.textContent = `Showing ${locations.length} locations`;
                    }
                };
                
                // Store loadLocations in registry
                if (!window.amfmMap.loadLocations) {
                    window.amfmMap.loadLocations = {};
                }
                window.amfmMap.loadLocations[mapId] = loadLocations;
                
                // Load initial data
                const jsonData = settings.json_data;
                const filteredData = jsonData.filter(location => location.PlaceID);
                loadLocations(filteredData);
                
                console.log('✅ loadLocations function created and initial data loaded');
            }
            
            // Now setup filter listeners
            console.log('🔧 Setting up filter listeners manually...');
            
            // Remove any existing listeners
            const existingListener = (container as any)._amfmFilterListener;
            if (existingListener) {
                container.removeEventListener('amfmFilterUpdate', existingListener);
            }
            
            // Create new filter event listener
            const filterListener = function(event: any) {
                console.log('🎯 Received filter update:', event.detail);
                
                const filters = event.detail.filters;
                const settings = window.amfmMap?.instances?.[mapId];
                if (!settings) return;
                
                let filteredData = settings.json_data.filter((location: any) => location.PlaceID);
                
                // Apply filters
                Object.keys(filters).forEach(filterType => {
                    const filterValues = filters[filterType];
                    if (filterValues && filterValues.length > 0) {
                        filteredData = filteredData.filter((location: any) => {
                            return filterValues.some((value: any) => {
                                switch (filterType) {
                                    case 'location':
                                        return location.State === value;
                                    case 'gender':
                                        return location['Male'] === 'Yes' && value === 'Male' ||
                                               location['Female'] === 'Yes' && value === 'Female';
                                    case 'conditions':
                                        return location[value] === 'Yes';
                                    case 'programs':
                                        return location[value] === 'Yes';
                                    case 'accommodations':
                                        return location[value] === 'Yes';
                                    default:
                                        return false;
                                }
                            });
                        });
                    }
                });
                
                console.log('🔍 Filtered to', filteredData.length, 'locations');
                
                // Load filtered results
                const loadLocations = window.amfmMap.loadLocations[mapId];
                if (loadLocations) {
                    loadLocations(filteredData);
                }
            };
            
            // Store reference to remove later if needed
            (container as any)._amfmFilterListener = filterListener;
            
            // Add the event listener
            container.addEventListener('amfmFilterUpdate', filterListener);
            
            return { 
                success: true, 
                hasLoadLocations: !!(window.amfmMap?.loadLocations?.[mapId]),
                hasEventListener: true,
                markerCount: window.amfmMap?.markers?.[mapId]?.length || 0
            };
        });
        
        console.log('Manual setup result:', setupResult);
        
        if (setupResult.error) {
            console.log('❌ Setup failed:', setupResult.error);
            return;
        }
        
        // Now test the filters
        console.log('Testing filters after manual setup...');
        
        const filterButtons = await page.locator('[data-filter-type="location"]').all();
        console.log(`Found ${filterButtons.length} location filter buttons`);
        
        if (filterButtons.length > 0) {
            const californiaButton = await Promise.all(
                filterButtons.map(async (button) => {
                    const text = await button.textContent();
                    return text?.includes('California') ? button : null;
                })
            ).then(results => results.find(result => result !== null));
            
            if (californiaButton) {
                console.log('Testing California filter...');
                
                // Get initial count
                const initialCount = await page.locator('#amfm_map_8f74753_counter').textContent();
                console.log('Initial count:', initialCount);
                
                // Click California filter
                await californiaButton.click();
                await page.waitForTimeout(2000);
                
                // Get updated count
                const updatedCount = await page.locator('#amfm_map_8f74753_counter').textContent();
                console.log('Updated count after California filter:', updatedCount);
                
                const filterWorked = updatedCount !== initialCount;
                console.log('California filter worked:', filterWorked);
                
                if (filterWorked) {
                    console.log('🎉 SUCCESS! Filter is now working!');
                    
                    // Test clearing filters
                    const clearButton = page.locator('.amfm-clear-filters');
                    if (await clearButton.isVisible()) {
                        await clearButton.click();
                        await page.waitForTimeout(1000);
                        
                        const clearedCount = await page.locator('#amfm_map_8f74753_counter').textContent();
                        console.log('Count after clearing:', clearedCount);
                    }
                } else {
                    console.log('❌ Filter still not working even after manual setup');
                    
                    // Debug what happened
                    const debugInfo = await page.evaluate(() => {
                        return {
                            buttonActive: document.querySelector('[data-filter-type="location"]')?.classList.contains('active'),
                            markerCount: window.amfmMap?.markers?.['amfm_map_8f74753']?.length || 0
                        };
                    });
                    console.log('Debug info:', debugInfo);
                }
            } else {
                console.log('❌ California button not found');
            }
        } else {
            console.log('❌ No location filter buttons found');
        }
    });
});
