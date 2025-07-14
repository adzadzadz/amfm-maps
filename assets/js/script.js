jQuery(document).ready(function ($) {
    console.log('🔥 AMFM Maps Script v2.3.0 - LOADED WITH FALLBACK SUPPORT! 🔥');
    console.log('AMFM Maps');

    // Ensure the drawer container exists
    if (!$('#amfm-drawer').length) {
        jQuery('body').append(`
            <div id="amfm-drawer-overlay" class="amfm-drawer-overlay"></div>
            <div id="amfm-drawer" class="amfm-drawer">
                <button id="amfm-drawer-close" class="amfm-drawer-close">&times;</button>
                <div id="amfm-drawer-content" class="amfm-drawer-content"></div>
            </div>
        `);

        // Close drawer on button click
        jQuery('#amfm-drawer-close').on('click', function () {
            closeDrawer();
        });

        // Close drawer when clicking outside the drawer
        jQuery('#amfm-drawer-overlay').on('click', function () {
            closeDrawer();
        });
    }

    function closeDrawer() {
        jQuery('#amfm-drawer').removeClass('open');
        jQuery('#amfm-drawer-overlay').removeClass('visible');
        jQuery('body').off('click'); // Remove the body click event listener to prevent multiple bindings
    }

    function openDrawer(content) {
        jQuery('#amfm-drawer-content').html(content);
        jQuery('#amfm-drawer').addClass('open'); // Ensure the "open" class is added
        jQuery('#amfm-drawer-overlay').addClass('visible'); // Ensure the overlay is visible

        // Close drawer when clicking anywhere in the body except the drawer itself
        jQuery('body').on('click', function (event) {
            const drawer = jQuery('#amfm-drawer');
            const overlay = jQuery('#amfm-drawer-overlay');
            if (!drawer.is(event.target) && drawer.has(event.target).length === 0) {
                closeDrawer();
            }
        });
    }

    // Expose openDrawer globally for debugging
    window.openDrawer = openDrawer;
});

var amfm = {};
window.amfm = amfm;

// AMFM Map V2 Widget JavaScript
// Check if global object already exists, if not create it with registry structure
if (!window.amfmMapV2) {
    window.amfmMapV2 = {
        maps: {},        // Store multiple map instances by ID
        markers: {},     // Store markers by map ID  
        instances: {},   // Store configuration by map ID
        filteredData: {},// Store filtered data by map ID
        loadLocations: {},// Store loadLocations functions by map ID
        // Backward compatibility properties (will point to first initialized map)
        map: null,
        markers: [],
        loadLocations: null
    };
}
var amfmMapV2 = window.amfmMapV2;

amfmMapV2.init = function(settings) {
    var unique_id = settings.unique_id;
    
    // Prevent double initialization
    if (amfmMapV2.instances && amfmMapV2.instances[unique_id]) {
        console.log('⚠️ Map', unique_id, 'already initialized, skipping...');
        return;
    }
    
    var json_data = settings.json_data;
    var api_key = settings.api_key;
    
    var map;
    var markers = [];
    var filteredData = json_data.slice(); // Copy of data for filtering
    
    // Store this instance's data in the registry with null checks
    if (!amfmMapV2.markers) amfmMapV2.markers = {};
    if (!amfmMapV2.filteredData) amfmMapV2.filteredData = {};
    if (!amfmMapV2.instances) amfmMapV2.instances = {};
    if (!amfmMapV2.maps) amfmMapV2.maps = {};
    if (!amfmMapV2.loadLocations) amfmMapV2.loadLocations = {};
    
    amfmMapV2.markers[unique_id] = markers;
    amfmMapV2.filteredData[unique_id] = filteredData;
    amfmMapV2.instances[unique_id] = settings;
    
    console.log('🔍 Registry setup for unique_id:', unique_id, 'markers array length:', markers.length);
    
    // Initialize the map
    function initMap() {
        var mapElement = document.getElementById(unique_id + '_map');
        if (!mapElement) {
            console.error('Map element not found:', unique_id + '_map');
            return;
        }
        
        // Remove any loading indicator
        mapElement.style.background = '';
        
        var centerPoint = { lat: 39.8283, lng: -98.5795 }; // Center US
        map = new google.maps.Map(mapElement, {
            center: centerPoint,
            zoom: 4,
            mapTypeControl: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });
        
        // Expose the map instance in the registry
        amfmMapV2.maps[unique_id] = map;
        
        // For backward compatibility, set the first map as the default
        if (!amfmMapV2.map) {
            amfmMapV2.map = map;
            // Note: Don't overwrite amfmMapV2.markers object, it contains multiple map instances
        }
        
        console.log('Map initialized for:', unique_id);
        console.log('🔍 About to set up initialization timeouts...');
        
        // Instead of relying on the unreliable 'idle' event, use a more robust approach
        function initializeMapData() {
            console.log('🚀 Initializing map data and filters...');
            
            // Filter data to only include locations with PlaceID for precision
            filteredData = json_data.filter(function(location) {
                return location.PlaceID; // Only use locations with PlaceID
            });
            
            console.log('Initial load: showing', filteredData.length, 'locations with PlaceID');
            
            // Update results counter for initial load
            updateResultsCounter(filteredData.length);
            
            // Load locations initially
            loadLocations(filteredData);
            
            // Store loadLocations function in registry
            amfmMapV2.loadLocations[unique_id] = loadLocations;
            
            // For backward compatibility, set the first loadLocations as the default
            if (!amfmMapV2.loadLocations) {
                amfmMapV2.loadLocations = loadLocations;
            }
            
            // Set up filter event listeners
            setupFilterListeners();
        }
        
        // Try immediate initialization (most reliable for most environments)
        setTimeout(function() {
            if (!amfmMapV2.loadLocations || !amfmMapV2.loadLocations[unique_id]) {
                console.log('🎯 Immediate initialization...');
                initializeMapData();
            }
        }, 100);
        
        // Also try idle event as fallback (for environments where it works)
        google.maps.event.addListenerOnce(map, 'idle', function() {
            if (!amfmMapV2.loadLocations || !amfmMapV2.loadLocations[unique_id]) {
                console.log('Map idle event fired, loading locations...');
                initializeMapData();
            }
        });
        
        // Final fallback timeout (in case both above methods fail)
        setTimeout(function() {
            if (!amfmMapV2.loadLocations || !amfmMapV2.loadLocations[unique_id]) {
                console.log('⚠️ Using final fallback initialization...');
                initializeMapData();
            }
        }, 2000);
    }
    
    // Check if Google Maps is loaded and initialize
    function checkGoogleMapsAndInit() {
        var mapElement = document.getElementById(unique_id + '_map');
        if (mapElement && typeof google !== 'undefined' && google.maps && google.maps.Map) {
            console.log('Google Maps API loaded, initializing map...');
            initMap();
        } else {
            console.log('Waiting for Google Maps API to load...');
            // Add loading indicator
            if (mapElement) {
                mapElement.style.background = '#f0f0f0 url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 50 50\'%3E%3Cpath d=\'M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' from=\'0 25 25\' to=\'360 25 25\' dur=\'0.5s\' repeatCount=\'indefinite\'/%3E%3C/path%3E%3C/svg%3E") center center no-repeat';
            }
            // Wait a bit more for Google Maps to load
            setTimeout(checkGoogleMapsAndInit, 300);
        }
    }
    
    // Start the initialization process
    checkGoogleMapsAndInit();
    
    // Load locations on the map using PlaceID only - IMPROVED VERSION
    function loadLocations(data) {
        console.log('loadLocations called with', data ? data.length : 0, 'locations');
        
        if (!data || data.length === 0) {
            console.log('No data to load, hiding all markers and updating counter to 0');
            hideAllMarkers();
            updateResultsCounter(0);
            return;
        }
        
        var bounds = new google.maps.LatLngBounds();
        var service = new google.maps.places.PlacesService(map);
        var validLocations = 0;
        var processedCount = 0;
        var totalLocations = data.filter(location => location.PlaceID).length;
        var dataPlaceIds = data.map(location => location.PlaceID).filter(id => id);
        
        console.log('Total locations with PlaceID:', totalLocations);
        
        if (totalLocations === 0) {
            console.log('No locations with PlaceID found');
            hideAllMarkers();
            updateResultsCounter(0);
            return;
        }
        
        // Hide all markers first
        hideAllMarkers();
        
        // Show only markers that match the filtered data
        markers.forEach(function(markerData) {
            if (dataPlaceIds.includes(markerData.placeId)) {
                markerData.marker.setVisible(true);
                bounds.extend(markerData.marker.getPosition());
                validLocations++;
            }
        });
        
        // If we already have all the markers we need, just update the bounds and counter
        var existingPlaceIds = markers.map(m => m.placeId);
        var newPlaceIds = dataPlaceIds.filter(id => !existingPlaceIds.includes(id));
        
        if (newPlaceIds.length === 0) {
            // All markers already exist, just fit bounds and update counter
            updateResultsCounter(validLocations);
            if (validLocations > 0 && !bounds.isEmpty()) {
                map.fitBounds(bounds);
            }
            return;
        }
        
        // Create new markers for places we don't have yet
        data.forEach(function(location) {
            if (!location.PlaceID || existingPlaceIds.includes(location.PlaceID)) {
                return; // Skip if no PlaceID or marker already exists
            }
            
            var request = {
                placeId: location.PlaceID,
                fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'opening_hours', 'formatted_phone_number', 'website']
            };
            
            service.getDetails(request, function(place, status) {
                processedCount++;
                console.log('Places API request processed:', processedCount, '/', newPlaceIds.length, 'Status:', status);
                
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name
                    });
                    
                    // Store marker with placeId for efficient filtering
                    var markerData = {
                        marker: marker,
                        placeId: location.PlaceID,
                        location: location,
                        place: place
                    };
                    
                    markers.push(markerData);
                    bounds.extend(place.geometry.location);
                    validLocations++;
                    
                    console.log('Marker created for:', place.name, 'Total markers:', markers.length);
                    console.log('Registry markers length for', unique_id, ':', amfmMapV2.markers[unique_id] ? amfmMapV2.markers[unique_id].length : 'not found');
                    console.log('Array reference check:', markers === amfmMapV2.markers[unique_id]);
                    
                    // Add click listener for popup/drawer
                    marker.addListener('click', function() {
                        var content = generateInfoWindowContent(place, location);
                        if (isMobile()) {
                            openDrawer(content);
                        } else {
                            var infoWindow = new google.maps.InfoWindow({
                                content: content,
                                maxWidth: 400
                            });
                            
                            // Close other info windows
                            markers.forEach(function(m) {
                                if (m.infoWindow) {
                                    m.infoWindow.close();
                                }
                            });
                            
                            infoWindow.open(map, marker);
                            markerData.infoWindow = infoWindow;
                        }
                    });
                } else {
                    console.error('Places API error for PlaceID', location.PlaceID, ':', status);
                }
                
                // When all new locations are processed, update the map view
                if (processedCount === newPlaceIds.length) {
                    console.log('All new Places API requests completed. Total valid locations:', validLocations);
                    updateResultsCounter(validLocations);
                    if (!bounds.isEmpty() && validLocations > 0) {
                        console.log('Fitting map bounds for', validLocations, 'markers');
                        map.fitBounds(bounds);
                        // Limit zoom level
                        google.maps.event.addListenerOnce(map, 'idle', function() {
                            if (map.getZoom() > 10) {
                                map.setZoom(10);
                            }
                        });
                    } else {
                        console.log('No valid locations to display on map');
                    }
                }
            });
        });
    }
    
    // Hide all markers without removing them
    function hideAllMarkers() {
        console.log('Hiding all markers');
        markers.forEach(function(markerData) {
            markerData.marker.setVisible(false);
            if (markerData.infoWindow) {
                markerData.infoWindow.close();
            }
        });
    }
    
    // Clear all markers from the map (only used for complete reset)
    function clearMarkers() {
        console.log('Clearing', markers.length, 'markers from map');
        markers.forEach(function(markerData) {
            if (markerData.infoWindow) {
                markerData.infoWindow.close();
            }
            markerData.marker.setMap(null);
        });
        markers = [];
        // Keep global markers array in sync
        amfmMapV2.markers = markers;
        console.log('All markers cleared, markers array length:', markers.length);
    }
    
    // Generate enhanced info window content with image slider
    function generateInfoWindowContent(place, locationData) {
        var photos = place.photos || [];
        var photoSlider = '';

        // Create photo slider if photos exist
        if (photos.length > 0) {
            photoSlider = '<div class="amfm-maps-photo-slider owl-carousel">';
            photos.forEach(function (photo) {
                var photoUrl = photo.getUrl({ maxWidth: 400, maxHeight: 250 });
                photoSlider += `<div class="amfm-maps-photo-slide">
                                    <img src="${photoUrl}" alt="Photo" style="width: 100%; height: auto; border-radius: 8px;">
                                </div>`;
            });
            photoSlider += '</div>';
        } else if (locationData && locationData.Image) {
            // Fallback to location data image
            photoSlider = `<div class="amfm-maps-single-photo">
                            <img src="${locationData.Image}" alt="Location Image" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin: 10px 0;">
                           </div>`;
        }

        // Clean website URL (remove UTM parameters)
        var cleanWebsite = place.website;
        if (cleanWebsite) {
            try {
                const url = new URL(cleanWebsite);
                const params = new URLSearchParams(url.search);
                params.delete('utm_source');
                params.delete('utm_medium');
                params.delete('utm_campaign');
                cleanWebsite = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '');
            } catch (e) {
                // Keep original URL if parsing fails
            }
        }

        var content = `
            <div class="amfm-map-info-content" style="line-height: 1.6; max-width: 380px;">
                ${photoSlider}
                <div class="amfm-maps-info-wrapper" style="padding: 10px 0;">
                    <!-- Name -->
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #333;">
                        ${place.name || locationData?.['(Internal) Name'] || 'AMFM Location'}
                    </div>
                    
                    <!-- Rating -->
                    ${place.rating ? `<div style="font-size: 14px; margin-bottom: 8px; display: flex; align-items: center;">
                        <span style="color: #333; margin-right: 5px;">${place.rating.toFixed(1)}</span> 
                        <span style="color: #ffc107;">${generateStars(place.rating)}</span>
                    </div>` : ""}
                    
                    <!-- Address -->
                    <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                        ${place.formatted_address || "Address not available"}
                    </div>
                    
                    <!-- Phone -->
                    ${place.formatted_phone_number ? `<div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                        <strong>Phone:</strong> ${place.formatted_phone_number}
                    </div>` : ""}
                    
                    <!-- Hours -->
                    ${place.opening_hours?.weekday_text ? `<div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                        <strong>Hours:</strong> ${place.opening_hours.weekday_text[0] || 'See website for hours'}
                    </div>` : ""}
                    
                    <!-- Additional Info from Location Data -->
                    ${locationData?.['Details: Gender'] ? `<div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                        <strong>Gender:</strong> ${locationData['Details: Gender']}
                    </div>` : ""}
                    
                    ${locationData?.['Details: Age Groups'] ? `<div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                        <strong>Age Groups:</strong> ${locationData['Details: Age Groups']}
                    </div>` : ""}
                    
                    <!-- Website Button -->
                    ${cleanWebsite ? `<div style="margin-top: 15px;">
                        <a href="${cleanWebsite}" target="_blank" class="amfm-website-button" 
                           style="display: inline-block; background: #007cba; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">
                            View Location
                        </a>
                    </div>` : ""}
                </div>
            </div>
        `;
        return content;
    }
    
    // Generate star rating HTML
    function generateStars(rating) {
        var stars = '';
        var fullStars = Math.floor(rating);
        var hasHalfStar = rating % 1 >= 0.5;
        
        for (var i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '☆';
        }
        for (var i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars += '☆';
        }
        return stars;
    }
    
    // Mobile detection
    function isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Enhanced drawer functionality
    function openDrawer(content) {
        // Ensure drawer exists (it should from the top of the file)
        if (!jQuery('#amfm-drawer').length) {
            console.error('Drawer element not found');
            return;
        }
        
        jQuery('#amfm-drawer-content').html(`
            <div class="amfm-loading-spinner" style="text-align: center; padding: 20px;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
                <p style="margin-top: 10px; color: #666;">Loading...</p>
            </div>
            ${content}
        `);
        
        jQuery('#amfm-drawer').addClass('open');
        jQuery('#amfm-drawer-overlay').addClass('visible');

        // Initialize Owl Carousel after content loads
        setTimeout(function() {
            if (jQuery('.amfm-maps-photo-slider').length > 0) {
                // Wait for images to load before initializing carousel
                jQuery('.amfm-maps-photo-slider').imagesLoaded(function () {
                    jQuery('.amfm-loading-spinner').remove();
                    
                    if (!jQuery('.amfm-maps-photo-slider').hasClass('owl-loaded')) {
                        jQuery('.amfm-maps-photo-slider').owlCarousel({
                            items: 1,
                            loop: photos.length > 1,
                            nav: true,
                            navText: ['‹', '›'],
                            dots: photos.length > 1,
                            autoplay: photos.length > 1,
                            autoplayTimeout: 4000,
                            autoplayHoverPause: true,
                            responsive: {
                                0: { items: 1 },
                                600: { items: 1 },
                                1000: { items: 1 }
                            }
                        });
                    }
                });
            } else {
                jQuery('.amfm-loading-spinner').remove();
            }
        }, 100);
    }
    
    // Clear all markers from the map (only used for complete reset)
    function clearMarkers() {
        console.log('Clearing', markers.length, 'markers from map');
        markers.forEach(function(markerData) {
            if (markerData.infoWindow) {
                markerData.infoWindow.close();
            }
            markerData.marker.setMap(null);
        });
        markers = [];
        // Keep global markers array in sync
        amfmMapV2.markers[unique_id] = markers;
        console.log('All markers cleared, markers array length:', markers.length);
    }
    
    // Update the results counter
    function updateCounter(count) {
        updateResultsCounter(count);
    }
    
    // Update results counter (universal function)
    function updateResultsCounter(count) {
        var counterElement = document.getElementById(unique_id + '_counter');
        if (counterElement) {
            counterElement.textContent = 'Showing ' + count + ' location' + (count !== 1 ? 's' : '');
        }
    }
    
    // Set up filter event listeners
    function setupFilterListeners() {
        var container = document.getElementById(unique_id);
        if (!container) {
            console.error('Container not found for setupFilterListeners:', unique_id);
            return;
        }
        
        console.log('🔧 Setting up filter listeners for container:', unique_id, 'Container element found:', !!container);
        
        // All map widgets listen for external filter updates
        container.addEventListener('amfmFilterUpdate', function(event) {
            console.log('🎯 Received filter update from external filter on container:', unique_id, 'Event detail:', event.detail);
            var externalFilters = event.detail.filters;
            applyExternalFilters(externalFilters);
        });
        
        // Check if this widget has internal filters (legacy combined widget support)
        var filterButtons = container.querySelectorAll('.amfm-filter-button:not(.amfm-clear-filters)');
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        var clearButton = container.querySelector('.amfm-clear-filters');
        
        if (filterButtons.length > 0 || checkboxes.length > 0) {
            console.log('Found internal filter elements:', {
                buttons: filterButtons.length,
                checkboxes: checkboxes.length,
                clearButton: clearButton ? 'found' : 'not found'
            });
            
            // Add event listeners to filter buttons (internal filters)
            filterButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    console.log('Internal filter button clicked:', button.getAttribute('data-filter-type'), button.getAttribute('data-filter-value'));
                    button.classList.toggle('active');
                    applyFilters();
                });
            });
            
            // Add event listeners to checkboxes (for sidebar layout)
            checkboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', function() {
                    console.log('Internal checkbox changed:', checkbox.name, checkbox.value, checkbox.checked);
                    applyFilters();
                });
            });
            
            // Add event listener to clear button
            if (clearButton) {
                clearButton.addEventListener('click', function() {
                    console.log('Internal clear button clicked');
                    clearAllFilters();
                });
            }
        }
    }
    
    // Apply external filters from filter widget
    function applyExternalFilters(externalFilters) {
        console.log('Applying external filters:', externalFilters);
        console.log('Available maps in registry:', Object.keys(amfmMapV2.maps));
        console.log('Current map instance ID:', unique_id);
        
        // Get the map and data for this specific instance
        var currentMap = amfmMapV2.maps[unique_id];
        var currentMarkers = amfmMapV2.markers[unique_id];
        var currentData = amfmMapV2.instances[unique_id]?.json_data;
        
        console.log('Map object exists:', !!currentMap);
        console.log('Map instance:', currentMap);
        
        // Ensure map is initialized before applying filters
        if (!currentMap || !currentData) {
            console.error('Map or data not found for ID:', unique_id, {
                map: !!currentMap,
                data: !!currentData
            });
            return;
        }
        
        // Filter the data based on PlaceID precision and external filters
        var newFilteredData = currentData.filter(function(location) {
            // Skip locations without PlaceID for precision
            if (!location.PlaceID) {
                console.log('Skipping location without PlaceID:', location.Name);
                return false;
            }
            
            // If no filters are active, show all locations with PlaceID
            var hasActiveFilters = Object.values(externalFilters).some(arr => arr.length > 0);
            if (!hasActiveFilters) {
                return true;
            }
            
            // Location filter
            if (externalFilters.location && externalFilters.location.length > 0) {
                var locationMatch = false;
                externalFilters.location.forEach(function(filterLocation) {
                    var stateAbbr = getStateAbbreviation(filterLocation);
                    if (location.State === stateAbbr) {
                        locationMatch = true;
                    }
                });
                if (!locationMatch) {
                    console.log('Location filter failed for:', location.Name, 'State:', location.State, 'Required:', externalFilters.location);
                    return false;
                }
            }
            
            // Gender filter
            if (externalFilters.gender && externalFilters.gender.length > 0) {
                if (!externalFilters.gender.includes(location['Details: Gender'])) {
                    console.log('Gender filter failed for:', location.Name, 'Gender:', location['Details: Gender'], 'Required:', externalFilters.gender);
                    return false;
                }
            }
            
            // Conditions filter
            if (externalFilters.conditions && externalFilters.conditions.length > 0) {
                var conditionMatch = false;
                externalFilters.conditions.forEach(function(condition) {
                    if (location['Conditions: ' + condition] == 1) {
                        conditionMatch = true;
                    }
                });
                if (!conditionMatch) {
                    console.log('Conditions filter failed for:', location.Name, 'Required conditions:', externalFilters.conditions);
                    return false;
                }
            }
            
            // Programs filter
            if (externalFilters.programs && externalFilters.programs.length > 0) {
                var programMatch = false;
                externalFilters.programs.forEach(function(program) {
                    if (location['Programs: ' + program] == 1) {
                        programMatch = true;
                    }
                });
                if (!programMatch) {
                    console.log('Programs filter failed for:', location.Name, 'Required programs:', externalFilters.programs);
                    return false;
                }
            }
            
            // Accommodations filter
            if (externalFilters.accommodations && externalFilters.accommodations.length > 0) {
                var accommodationMatch = false;
                externalFilters.accommodations.forEach(function(accommodation) {
                    if (location['Accomodations: ' + accommodation] == 1) {
                        accommodationMatch = true;
                    }
                });
                if (!accommodationMatch) {
                    console.log('Accommodations filter failed for:', location.Name, 'Required accommodations:', externalFilters.accommodations);
                    return false;
                }
            }
            
            console.log('Location passed all external filters:', location.Name);
            return true;
        });
        
        console.log('Filtered locations count from external filters:', newFilteredData.length);
        
        // Update this instance's filtered data in the registry
        amfmMapV2.filteredData[unique_id] = newFilteredData;
        
        // For backward compatibility, also update global if this is the default map
        if (amfmMapV2.map === currentMap) {
            amfmMapV2.filteredData = newFilteredData;
        }
        
        // Update results counter
        updateResultsCounter(newFilteredData.length);
        
        // Load filtered locations using the loadLocations function for this instance
        var loadLocationsFn = amfmMapV2.loadLocations[unique_id];
        if (loadLocationsFn) {
            loadLocationsFn(newFilteredData);
        } else {
            console.error('loadLocations function not found for map ID:', unique_id);
        }
    }
    
    // Apply filters to the data (internal filters)
    function applyFilters() {
        var container = document.getElementById(unique_id);
        if (!container) return;
        
        console.log('Applying filters...');
        
        var activeFilters = {
            location: [],
            gender: [],
            conditions: [],
            programs: [],
            accommodations: []
        };
        
        // Collect active filters from buttons
        var activeButtons = container.querySelectorAll('.amfm-filter-button.active:not(.amfm-clear-filters)');
        activeButtons.forEach(function(button) {
            var filterType = button.getAttribute('data-filter-type');
            var filterValue = button.getAttribute('data-filter-value');
            
            if (activeFilters[filterType]) {
                activeFilters[filterType].push(filterValue);
            }
        });
        
        // Collect active filters from checkboxes (sidebar layout)
        var checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(function(checkbox) {
            var filterType = checkbox.name;
            var filterValue = checkbox.value;
            
            if (activeFilters[filterType]) {
                activeFilters[filterType].push(filterValue);
            }
        });
        
        console.log('Active filters:', activeFilters);
        console.log('Total locations before filtering:', json_data.length);
        
        // Apply filters to the data (internal filters)
        filteredData = json_data.filter(function(location) {
            // Skip locations without PlaceID for precision
            if (!location.PlaceID) {
                console.log('Skipping location without PlaceID:', location.Name);
                return false;
            }
            
            // If no filters are active, show all locations with PlaceID
            var hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
            if (!hasActiveFilters) {
                return true;
            }
            
            // Location filter
            if (activeFilters.location.length > 0) {
                var locationMatch = false;
                activeFilters.location.forEach(function(filterLocation) {
                    var stateAbbr = getStateAbbreviation(filterLocation);
                    if (location.State === stateAbbr) {
                        locationMatch = true;
                    }
                });
                if (!locationMatch) {
                    console.log('Location filter failed for:', location.Name, 'State:', location.State, 'Required:', activeFilters.location);
                    return false;
                }
            }
            
            // Gender filter
            if (activeFilters.gender.length > 0) {
                if (!activeFilters.gender.includes(location['Details: Gender'])) {
                    console.log('Gender filter failed for:', location.Name, 'Gender:', location['Details: Gender'], 'Required:', activeFilters.gender);
                    return false;
                }
            }
            
            // Conditions filter
            if (activeFilters.conditions.length > 0) {
                var conditionMatch = false;
                activeFilters.conditions.forEach(function(condition) {
                    if (location['Conditions: ' + condition] == 1) {
                        conditionMatch = true;
                    }
                });
                if (!conditionMatch) {
                    console.log('Conditions filter failed for:', location.Name, 'Required conditions:', activeFilters.conditions);
                    return false;
                }
            }
            
            // Programs filter
            if (activeFilters.programs.length > 0) {
                var programMatch = false;
                activeFilters.programs.forEach(function(program) {
                    if (location['Programs: ' + program] == 1) {
                        programMatch = true;
                    }
                });
                if (!programMatch) {
                    console.log('Programs filter failed for:', location.Name, 'Required programs:', activeFilters.programs);
                    return false;
                }
            }
            
            // Accommodations filter
            if (activeFilters.accommodations.length > 0) {
                var accommodationMatch = false;
                activeFilters.accommodations.forEach(function(accommodation) {
                    if (location['Accomodations: ' + accommodation] == 1) {
                        accommodationMatch = true;
                    }
                });
                if (!accommodationMatch) {
                    console.log('Accommodations filter failed for:', location.Name, 'Required accommodations:', activeFilters.accommodations);
                    return false;
                }
            }
            
            console.log('Location passed all filters:', location.Name);
            return true;
        });
        
        console.log('Filtered locations count:', filteredData.length);
        
        // Update this instance's filtered data in the registry
        amfmMapV2.filteredData[unique_id] = filteredData;
        
        // For backward compatibility, also update global if this is the default map
        var currentMap = amfmMapV2.maps[unique_id];
        if (amfmMapV2.map === currentMap) {
            amfmMapV2.filteredData = filteredData;
        }
        
        // Update results counter
        updateResultsCounter(filteredData.length);
        
        // Load filtered locations using the loadLocations function for this instance
        var loadLocationsFn = amfmMapV2.loadLocations[unique_id];
        if (loadLocationsFn) {
            loadLocationsFn(filteredData);
        } else {
            console.error('loadLocations function not found for map ID:', unique_id);
        }
    }
    
    // Clear all filters
    function clearAllFilters() {
        var container = document.getElementById(unique_id);
        if (!container) return;
        
        console.log('Clearing all filters...');
        
        // Clear button filters
        var activeButtons = container.querySelectorAll('.amfm-filter-button.active:not(.amfm-clear-filters)');
        activeButtons.forEach(function(button) {
            button.classList.remove('active');
        });
        
        // Clear checkbox filters
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });
        
        // Reset to show all locations with PlaceID
        filteredData = json_data.filter(function(location) {
            return location.PlaceID; // Only show locations with PlaceID
        });
        
        console.log('After clearing filters, showing:', filteredData.length, 'locations');
        
        // Update this instance's filtered data in the registry
        amfmMapV2.filteredData[unique_id] = filteredData;
        
        // For backward compatibility, also update global if this is the default map
        var currentMap = amfmMapV2.maps[unique_id];
        if (amfmMapV2.map === currentMap) {
            amfmMapV2.filteredData = filteredData;
        }
        
        // Update results counter
        updateResultsCounter(filteredData.length);
        
        // Load filtered locations using the loadLocations function for this instance
        var loadLocationsFn = amfmMapV2.loadLocations[unique_id];
        if (loadLocationsFn) {
            loadLocationsFn(filteredData);
        } else {
            console.error('loadLocations function not found for map ID:', unique_id);
        }
    }
    
    // Helper function to get state abbreviation from full name
    function getStateAbbreviation(stateName) {
        var states = {
            'California': 'CA',
            'Virginia': 'VA',
            'Washington': 'WA',
            'Minnesota': 'MN',
            'Oregon': 'OR'
        };
        return states[stateName] || stateName;
    }
};

// AMFM Map V2 Filter Widget JavaScript
var amfmMapV2Filter = {};
window.amfmMapV2Filter = amfmMapV2Filter;

amfmMapV2Filter.init = function(settings) {
    var unique_id = settings.unique_id;
    var target_map_id = settings.target_map_id;
    var json_data = settings.json_data;
    
    console.log('Initializing AMFM Filter V2:', unique_id);
    console.log('Target map ID:', target_map_id);
    
    // Set up filter event listeners
    function setupFilterListeners() {
        var container = document.getElementById(unique_id);
        if (!container) {
            console.error('Filter container not found:', unique_id);
            return;
        }
        
        console.log('Setting up filter listeners for filter widget:', unique_id);
        
        // Handle button filters
        var filterButtons = container.querySelectorAll('.amfm-filter-button:not(.amfm-clear-filters)');
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        var clearButton = container.querySelector('.amfm-clear-filters');
        
        console.log('Found filter elements:', {
            buttons: filterButtons.length,
            checkboxes: checkboxes.length,
            clearButton: clearButton ? 'found' : 'not found'
        });
        
        // Add event listeners to filter buttons
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                console.log('Filter button clicked:', button.getAttribute('data-filter-type'), button.getAttribute('data-filter-value'));
                button.classList.toggle('active');
                notifyMapWidgets();
            });
        });
        
        // Add event listeners to checkboxes (for sidebar layout)
        checkboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                console.log('Checkbox changed:', checkbox.name, checkbox.value, checkbox.checked);
                notifyMapWidgets();
            });
        });
        
        // Add event listener to clear button
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                console.log('Clear button clicked in filter widget');
                clearAllFilters();
            });
        }
    }
    
    // Get active filters from the filter widget
    function getActiveFilters() {
        var container = document.getElementById(unique_id);
        if (!container) return {};
        
        var activeFilters = {
            location: [],
            gender: [],
            conditions: [],
            programs: [],
            accommodations: []
        };
        
        // Collect active filters from buttons
        var activeButtons = container.querySelectorAll('.amfm-filter-button.active:not(.amfm-clear-filters)');
        activeButtons.forEach(function(button) {
            var filterType = button.getAttribute('data-filter-type');
            var filterValue = button.getAttribute('data-filter-value');
            
            if (activeFilters[filterType]) {
                activeFilters[filterType].push(filterValue);
            }
        });
        
        // Collect active filters from checkboxes (sidebar layout)
        var checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(function(checkbox) {
            var filterType = checkbox.name;
            var filterValue = checkbox.value;
            
            if (activeFilters[filterType]) {
                activeFilters[filterType].push(filterValue);
            }
        });
        
        return activeFilters;
    }
    
    // Notify target map widgets about filter changes
    function notifyMapWidgets() {
        var activeFilters = getActiveFilters();
        console.log('Notifying map widgets with filters:', activeFilters);
        console.log('Filter widget target_map_id setting:', target_map_id);
        
        // Debug: Show all elements on page starting with amfm_map_v2
        var allMapElements = document.querySelectorAll('[id^="amfm_map_v2"]');
        console.log('All elements with IDs starting with amfm_map_v2:');
        allMapElements.forEach(function(el) {
            var hasDirectMapWrapper = el.classList.contains('amfm-map-wrapper') || el.children.length > 0 && Array.from(el.children).some(child => child.classList.contains('amfm-map-wrapper'));
            var hasAnyMapWrapper = !!el.querySelector('.amfm-map-wrapper');
            console.log('  - Element ID:', el.id, 'Has direct map wrapper:', hasDirectMapWrapper, 'Has any map wrapper:', hasAnyMapWrapper);
        });
        
        // Simple and reliable container targeting
        function findCorrectMapContainers(targetMapId) {
            console.log('Finding map containers for target:', targetMapId);
            var containers = [];
            
            if (targetMapId) {
                // Strategy 1: Look for .amfm-map-v2-container within the target map ID
                var targetElement = document.getElementById(targetMapId);
                if (targetElement) {
                    var mapContainer = targetElement.querySelector('.amfm-map-v2-container');
                    if (mapContainer) {
                        console.log('Found map container within target:', mapContainer.id);
                        containers.push(mapContainer.id);
                    } else {
                        console.log('No .amfm-map-v2-container found within target:', targetMapId);
                    }
                }
                
                // Strategy 2: If target element itself has the class
                if (targetElement && targetElement.classList.contains('amfm-map-v2-container')) {
                    console.log('Target element itself is a map container:', targetMapId);
                    containers.push(targetMapId);
                }
            }
            
            // Fallback: If no specific target or no containers found, target all .amfm-map-v2-container
            if (containers.length === 0) {
                console.log('No specific containers found, targeting all .amfm-map-v2-container elements');
                var allMapContainers = document.querySelectorAll('.amfm-map-v2-container');
                allMapContainers.forEach(function(container) {
                    if (container.id) {
                        console.log('Found map container:', container.id);
                        containers.push(container.id);
                    }
                });
            }
            
            return containers;
        }
        
        // Find target map widget(s)
        var mapWidgets = [];
        
        if (target_map_id) {
            console.log('Looking for specific target map widget ID:', target_map_id);
            mapWidgets = findCorrectMapContainers(target_map_id);
        } else {
            console.log('No specific target, finding all map containers');
            mapWidgets = findCorrectMapContainers(null);
        }
        
        console.log('Found map widgets to update:', mapWidgets);
        
        // Send filter update to each map widget
        mapWidgets.forEach(function(mapId) {
            console.log('Dispatching amfmFilterUpdate event to:', mapId);
            
            // Trigger custom event for map widget to listen to
            var event = new CustomEvent('amfmFilterUpdate', {
                detail: {
                    filters: activeFilters,
                    sourceFilterId: unique_id
                }
            });
            
            var mapContainer = document.getElementById(mapId);
            if (mapContainer) {
                console.log('Found map container, dispatching event to:', mapId);
                mapContainer.dispatchEvent(event);
            } else {
                console.log('Map container not found for ID:', mapId);
            }
        });
    }
    
    // Clear all filters in the filter widget
    function clearAllFilters() {
        var container = document.getElementById(unique_id);
        if (!container) return;
        
        console.log('Clearing all filters in filter widget...');
        
        // Clear button filters
        var activeButtons = container.querySelectorAll('.amfm-filter-button.active:not(.amfm-clear-filters)');
        activeButtons.forEach(function(button) {
            button.classList.remove('active');
        });
        
        // Clear checkbox filters
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });
        
        // Notify map widgets
        notifyMapWidgets();
    }
    
    // Initialize the filter widget
    setupFilterListeners();
    
    // Expose methods for external access
    return {
        getActiveFilters: getActiveFilters,
        clearAllFilters: clearAllFilters,
        notifyMapWidgets: notifyMapWidgets
    };
};