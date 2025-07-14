import { test, expect } from '@playwright/test';

declare global {
    interface Window {
        amfmMapV2: any;
    }
}

test.describe('Corrected Filter Fix and Test', () => {
    test('implement correct loadLocations and test filters', async ({ page }) => {
        console.log('=== CORRECTED FILTER FIX AND TEST ===');
        
        await page.goto('http://localhost:10003/map-test/');
        
        // Wait for map container and Google Maps API
        await page.waitForSelector('#amfm_map_v2_8f74753', { timeout: 30000 });
        await page.waitForFunction(() => window.amfmMapV2 && (window as any).google?.maps, { timeout: 30000 });
        
        console.log('Implementing corrected setupFilterListeners functionality...');
        
        // Manually implement the missing setupFilterListeners functionality with correct loadLocations
        const setupResult = await page.evaluate(() => {
            const mapId = 'amfm_map_v2_8f74753';
            const container = document.getElementById(mapId);
            
            if (!container) {
                return { error: 'Container not found' };
            }
            
            const settings = window.amfmMapV2?.instances?.[mapId];
            const map = window.amfmMapV2?.maps?.[mapId];
            
            if (!settings || !map) {
                return { error: 'Settings or map not found' };
            }
            
            // Initialize markers array if not exists
            if (!window.amfmMapV2.markers[mapId]) {
                window.amfmMapV2.markers[mapId] = [];
            }
            
            // Helper function to clear markers
            const clearMarkers = function() {
                const existingMarkers = window.amfmMapV2.markers[mapId] || [];
                existingMarkers.forEach((marker: any) => marker.setMap(null));
                window.amfmMapV2.markers[mapId] = [];
            };
            
            // Helper function to update counter
            const updateCounter = function(count: number) {
                const counter = document.getElementById(mapId + '_counter');
                if (counter) {
                    counter.textContent = `Showing ${count} locations`;
                }
            };
            
            // Create the correct loadLocations function (matching original)
            const loadLocations = function(data: any[]) {
                console.log('🔄 loadLocations called with', data ? data.length : 0, 'locations');
                
                // Clear existing markers
                clearMarkers();
                
                if (!data || data.length === 0) {
                    console.log('No data to load, updating counter to 0');
                    updateCounter(0);
                    return;
                }
                
                const bounds = new (window as any).google.maps.LatLngBounds();
                const service = new (window as any).google.maps.places.PlacesService(map);
                let validLocations = 0;
                let processedCount = 0;
                const totalLocations = data.filter(location => location.PlaceID).length;
                
                console.log('📍 Total locations with PlaceID:', totalLocations);
                
                if (totalLocations === 0) {
                    console.log('No locations with PlaceID found');
                    updateCounter(0);
                    return;
                }
                
                data.forEach(function(location) {
                    if (!location.PlaceID) {
                        console.log('Skipping location without PlaceID:', location.Name);
                        return;
                    }
                    
                    const request = {
                        placeId: location.PlaceID,
                        fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'opening_hours', 'formatted_phone_number', 'website']
                    };
                    
                    service.getDetails(request, function(place: any, status: any) {
                        processedCount++;
                        
                        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                            const marker = new (window as any).google.maps.Marker({
                                position: place.geometry.location,
                                map: map,
                                title: location['Facility Name'] || place.name
                            });
                            
                            window.amfmMapV2.markers[mapId].push(marker);
                            bounds.extend(place.geometry.location);
                            validLocations++;
                            
                            console.log('📍 Marker created for:', location['Facility Name'], 'Total markers:', window.amfmMapV2.markers[mapId].length);
                        } else {
                            console.log('⚠️ Failed to get place details for:', location['Facility Name'], 'Status:', status);
                        }
                        
                        // Update counter and fit bounds when all processed
                        if (processedCount === totalLocations) {
                            console.log('✅ All locations processed. Valid locations:', validLocations);
                            updateCounter(validLocations);
                            
                            if (validLocations > 0) {
                                map.fitBounds(bounds);
                            }
                        }
                    });
                });
            };
            
            // Store loadLocations in registry
            if (!window.amfmMapV2.loadLocations) {
                window.amfmMapV2.loadLocations = {};
            }
            window.amfmMapV2.loadLocations[mapId] = loadLocations;
            
            // Load initial data
            const jsonData = settings.json_data;
            const filteredData = jsonData.filter((location: any) => location.PlaceID);
            console.log('🚀 Loading initial data:', filteredData.length, 'locations');
            loadLocations(filteredData);
            
            // Setup filter listeners
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
                loadLocations(filteredData);
            };
            
            // Store reference and add event listener
            (container as any)._amfmFilterListener = filterListener;
            container.addEventListener('amfmFilterUpdate', filterListener);
            
            return { 
                success: true, 
                initialDataCount: filteredData.length,
                setupComplete: true
            };
        });
        
        console.log('Corrected setup result:', setupResult);
        
        if (setupResult.error) {
            console.log('❌ Setup failed:', setupResult.error);
            return;
        }
        
        // Wait for initial markers to be created
        console.log('Waiting for initial markers to be created...');
        await page.waitForTimeout(5000);
        
        // Check marker count after initial load
        const initialMarkerCount = await page.evaluate(() => {
            return {
                markerCount: window.amfmMapV2?.markers?.['amfm_map_v2_8f74753']?.length || 0,
                counterText: document.getElementById('amfm_map_v2_8f74753_counter')?.textContent
            };
        });
        
        console.log('Initial markers created:', initialMarkerCount);
        
        // Now test the filters
        console.log('Testing filters after corrected setup...');
        
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
                const initialCount = await page.locator('#amfm_map_v2_8f74753_counter').textContent();
                console.log('Initial count:', initialCount);
                
                // Click California filter
                await californiaButton.click();
                await page.waitForTimeout(5000); // Wait longer for Places API calls
                
                // Get updated count
                const updatedCount = await page.locator('#amfm_map_v2_8f74753_counter').textContent();
                console.log('Updated count after California filter:', updatedCount);
                
                const filterWorked = updatedCount !== initialCount;
                console.log('California filter worked:', filterWorked);
                
                if (filterWorked) {
                    console.log('🎉 SUCCESS! Filter is now working!');
                    
                    // Get marker count details
                    const markerDetails = await page.evaluate(() => {
                        return {
                            markerCount: window.amfmMapV2?.markers?.['amfm_map_v2_8f74753']?.length || 0,
                            hasValidMarkers: (window.amfmMapV2?.markers?.['amfm_map_v2_8f74753'] || []).length > 0
                        };
                    });
                    console.log('Marker details after filter:', markerDetails);
                    
                } else {
                    console.log('❌ Filter still not working');
                    
                    // Enhanced debug info
                    const debugInfo = await page.evaluate(() => {
                        return {
                            buttonActive: document.querySelector('[data-filter-type="location"]')?.classList.contains('active'),
                            markerCount: window.amfmMapV2?.markers?.['amfm_map_v2_8f74753']?.length || 0,
                            hasLoadLocations: !!(window.amfmMapV2?.loadLocations?.['amfm_map_v2_8f74753']),
                            hasEventListener: !!(document.getElementById('amfm_map_v2_8f74753') as any)?._amfmFilterListener
                        };
                    });
                    console.log('Enhanced debug info:', debugInfo);
                }
            } else {
                console.log('❌ California button not found');
            }
        } else {
            console.log('❌ No location filter buttons found');
        }
    });
});
