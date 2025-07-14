jQuery(document).ready(function ($) {
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

// Ensure global map storage object exists
if (!window.amfmMaps) {
    window.amfmMaps = {}; // Initialize global object to store map instances
}

amfm.initMap = function (settings) {
    var unique_id = settings.unique_id;
    var location_query = settings.location_query;
    var type = settings.type;
    var keyword = settings.keyword;
    var fields = settings.fields;
    var page_token = settings.page_token;
    var show_info = settings.show_info;
    var filter_class = settings.filter_class;

    var centerPoint = { lat: 39.8283, lng: -98.5795 };
    var map = new google.maps.Map(document.getElementById(unique_id), {
        center: centerPoint,
        zoom: 4,
        mapTypeControl: false // Disable satellite and map type options
    });

    // Initialize the PlacesService
    var service = new google.maps.places.PlacesService(map);

    // Store the map instance in the global object
    window.amfmMaps[unique_id] = {
        map: map,
        searchLocations: searchLocations // Expose searchLocations for this map instance
    };

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var markers = [];
    var pinnedLocationsCount = 0;

    function searchLocations(location_query, filter = null, nextPageToken = null, activeLocationFilter = null) {
        const locationsFilter = typeof settings.locations_filter === 'string' 
            ? JSON.parse(settings.locations_filter) 
            : settings.locations_filter; // Ensure locations_filter is parsed as an object
        const filtersJson = settings.filters_json;
        const useCustomLocations = settings.use_custom_locations === 'yes';
        const locationSets = settings.location_sets?.split(',').map(set => set.trim().toLowerCase()) || [];

        let filters = {};
        let locations = [];

        try {
            filters = typeof filtersJson === 'string' ? JSON.parse(filtersJson) : filtersJson;

            // Handle custom locations
            if (useCustomLocations && locationsFilter) {
                locations = [];
                const combinedFilters = new Set();

                // Prioritize activeLocationFilter
                if (activeLocationFilter) {
                    activeLocationFilter.split(',').map(filter => filter.trim().toLowerCase()).forEach(filter => combinedFilters.add(filter));
                } else {
                    // Fallback to locationSets if activeLocationFilter is not provided
                    locationSets.forEach(set => combinedFilters.add(set));
                }

                Object.keys(locationsFilter).forEach(locationSetKey => {
                    if (combinedFilters.has(locationSetKey)) {
                        locations = locations.concat(locationsFilter[locationSetKey]);
                    }
                });
            }
        } catch (e) {
            console.error('Invalid filters JSON or Locations Filter:', filtersJson, locationsFilter);
        }

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        bounds = new google.maps.LatLngBounds();
        pinnedLocationsCount = 0;

        if (useCustomLocations && locations.length > 0) {
            // Apply the existing filter to the current set of locations
            if (filter) {
                const activeFilters = filter.split(",").map(f => f.replace(/\s/g, "_").trim().toLowerCase());
                locations = locations.filter(location => {
                    const locationId = Object.keys(location)[0];
                    const normalizedAddress = location[locationId]?.toLowerCase() || '';

                    return activeFilters.some(filterKey => {
                        return filters[filterKey]?.some(filterAddress =>
                            normalizedAddress.includes(filterAddress.toLowerCase())
                        );
                    });
                });
            }

            console.log("Filtered Locations to display:", locations);

            // Use location IDs to display markers
            locations.forEach(location => {
                Object.keys(location).forEach(locationId => {
                    const request = {
                        placeId: locationId,
                        fields: fields // Ensure fields are passed correctly
                    };

                    service.getDetails(request, function (place, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const marker = new google.maps.Marker({
                                map: map,
                                position: place.geometry.location,
                                title: place.name,
                            });

                            markers.push(marker);
                            bounds.extend(place.geometry.location); // Extend bounds to include this marker
                            pinnedLocationsCount++;

                            // Add InfoWindow content
                            marker.addListener("click", function () {
                                const content = generateInfoWindowContent(place);
                                if (isMobile()) {
                                    openDrawer(content);
                                } else {
                                    openPopup(content, marker);
                                }
                            });
                        } else {
                            console.error(`Failed to fetch details for placeId: ${locationId}, status: ${status}`);
                        }
                    });
                });
            });

            // Adjust the map to fit all markers
            setTimeout(() => {
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds); // Fit the map to the bounds of all markers
                    google.maps.event.addListenerOnce(map, 'idle', function () {
                        const currentZoom = map.getZoom();
                        
                        if (currentZoom > 9) {
                            map.setZoom(9); // Limit the maximum zoom level
                        }
                    });
                } else {
                    console.warn("Bounds are empty. No markers to fit.");
                }
            }, 1000); // Delay to ensure all markers are processed

            updateInfo(pinnedLocationsCount);
            return;
        }

        // Default behavior: Use location query
        if (!useCustomLocations) {
            const request = {
                query: location_query,
                type: type,
                keyword: keyword,
                fields: fields,
                pageToken: nextPageToken || page_token,
                bounds: new google.maps.LatLngBounds(
                    { lat: 24.396308, lng: -125.000000 },
                    { lat: 49.384358, lng: -66.934570 }
                ),
            };

            console.log("filters data", filters);

            service.textSearch(request, function (results, status, pagination) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Process filter if not null
                    let activeFilters = [];
                    if (filter) {
                        activeFilters = filter.split(",").map(f => f.trim().replace(/\s/g, "_").toLowerCase());
                    }

                    console.log("Active Filters:", activeFilters);

                    // Filter results based on active filters
                    if (activeFilters.length > 0) {
                        results = results.filter(function (result) {
                            const normalizedResultAddress = result.formatted_address?.toLowerCase() || "";
                            return activeFilters.some(function (filterKey) {
                                if (filters[filterKey]) {
                                    return filters[filterKey].some(function (filterAddress) {
                                        return normalizedResultAddress.includes(filterAddress.toLowerCase());
                                    });
                                }
                                return false;
                            });
                        });
                    }

                    console.log("Filtered Locations:", results);

                    results.forEach(function (place) {
                        if (place.geometry && place.geometry.location) {
                            const marker = new google.maps.Marker({
                                map: map,
                                position: place.geometry.location,
                                title: place.name,
                            });

                            markers.push(marker);
                            bounds.extend(place.geometry.location);
                            pinnedLocationsCount++;

                            // Add InfoWindow content
                            marker.addListener("click", function () {
                                const content = generateInfoWindowContent(place);
                                if (isMobile()) {
                                    openDrawer(content);
                                } else {
                                    openPopup(content, marker);
                                }
                            });
                        }
                    });

                    if (results.length === 1) {
                        map.setCenter(results[0].geometry.location);
                        map.setZoom(12);
                    } else {
                        map.fitBounds(bounds);
                        google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
                            map.setZoom(map.getZoom() - 1);
                        });
                    }

                    updateInfo(pinnedLocationsCount);

                    if (pagination && pagination.hasNextPage) {
                        setTimeout(() => pagination.nextPage(), 2000);
                    }
                } else {
                    console.error("No locations found: " + status);
                    updateInfo(0, true);
                }
            });
        }
    }

    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star" style="color: #ffc107;"></i>';
        }
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt" style="color: #ffc107;"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star" style="color: #ffc107;"></i>';
        }
        return starsHtml;
    }

    function generateInfoWindowContent(place) {
        var photos = place.photos || [];
        var photoSlider = '';

        if (photos.length > 0) {
            photoSlider = '<div class="amfm-maps-photo-slider owl-carousel">';
            photos.forEach(function (photo) {
                var photoUrl = photo.getUrl({ maxWidth: 300, maxHeight: 200 });
                photoSlider += `<div class="amfm-maps-photo-slide">
                                    <img src="${photoUrl}" alt="Photo" style="width: 100%; height: auto;">
                                </div>`;
            });
            photoSlider += '</div>';
        }

        // place.website contains utm parameters, we need to remove them. Sample url https://amfmtreatment.com/california/male-rtc-in-dana-point/?utm_source=google&utm_medium=organic&utm_campaign=gbp-crystal-lantern
        if (place.website) {
            const url = new URL(place.website);
            const params = new URLSearchParams(url.search);
            params.delete('utm_source');
            params.delete('utm_medium');
            params.delete('utm_campaign');
            place.website = url.origin + url.pathname;
        }

        var content = `
            <div style="line-height: 1.6;">
                ${photoSlider}
                <div class="amfm-maps-info-wrapper">
                    <!-- Name -->
                    <div style="font-size: 18px; font-weight: bold; margin-top: 10px;">${place.name}</div>
                    <!-- Rating -->
                    ${place.rating ? `<div style="font-size: 14px; color: #ffc107; margin-top: 5px;">
                        <span style="color: #010101;">${place.rating.toFixed(1)}</span> ${generateStars(place.rating)}
                    </div>` : ""}
                    <!-- Address -->
                    <div style="font-size: 14px; color: #555; margin-top: 5px;">${place.formatted_address || "Address not available"}</div>
                    <!-- Website -->
                    ${place.website ? `
                    <div class="website-link-wrapper"">
                        <a href="${place.website}" target="_blank" class="amfm-website-button">
                            View Location
                        </a>
                    </div>` : ""}
                </div>
            </div>
        `;
        return content;
    }

    function openDrawer(content) {
        jQuery('#amfm-drawer-content').html(`
            <div class="amfm-loading-spinner"></div> <!-- Add loading spinner -->
            ${content}
        `);
        jQuery('#amfm-drawer').addClass('open');
        jQuery('#amfm-drawer-overlay').addClass('visible');

        // Initialize Owl Carousel after images are loaded
        jQuery('.amfm-maps-photo-slider').imagesLoaded(function () {
            jQuery('.amfm-loading-spinner').remove(); // Remove loading spinner
            jQuery('.amfm-maps-photo-slider').owlCarousel({
                items: 1,
                loop: true,
                nav: true,
                navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                dots: true,
                autoplay: true,
                autoplayTimeout: 3000,
                autoplayHoverPause: true,
                merge: true,
                mergeFit: true
            });
        });
    }

    function openPopup(content, marker) {
        if (isMobile()) {
            infowindow.setContent(`
                <div style="overflow: visible; max-width: 380px;">
                    <div class="amfm-loading-spinner"></div> <!-- Add loading spinner -->
                    ${content}
                </div>
            `);
            infowindow.open(map, marker);

            // Initialize Owl Carousel after images are loaded
            jQuery('.amfm-maps-photo-slider').imagesLoaded(function () {
                jQuery('.amfm-loading-spinner').remove(); // Remove loading spinner
                jQuery('.amfm-maps-photo-slider').owlCarousel({
                    items: 1,
                    loop: true,
                    nav: true,
                    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true
                });
            });
        } else {
            const mapContainer = document.getElementById(unique_id);
            if (!mapContainer.querySelector('.amfm-desktop-drawer')) {
                mapContainer.insertAdjacentHTML('beforeend', `
                    <div class="amfm-desktop-drawer-overlay"></div> <!-- Add overlay -->
                    <div class="amfm-desktop-drawer">
                        <div class="amfm-desktop-drawer-content">
                            <div class="amfm-loading-spinner"></div> <!-- Add loading spinner -->
                        </div>
                    </div>
                `);

                // Close drawer when clicking the overlay
                mapContainer.querySelector('.amfm-desktop-drawer-overlay').addEventListener('click', function () {
                    closeDesktopDrawer();
                });
            }

            const drawer = mapContainer.querySelector('.amfm-desktop-drawer');
            const drawerContent = drawer.querySelector('.amfm-desktop-drawer-content');
            drawerContent.innerHTML = `
                <div class="amfm-loading-spinner"></div> <!-- Add loading spinner -->
                ${content}
            `;
            drawer.classList.add('open');
            mapContainer.querySelector('.amfm-desktop-drawer-overlay').classList.add('visible');

            // Initialize Owl Carousel after images are loaded
            jQuery('.amfm-maps-photo-slider').imagesLoaded(function () {
                jQuery('.amfm-loading-spinner').remove(); // Remove loading spinner
                jQuery('.amfm-maps-photo-slider').owlCarousel({
                    items: 1,
                    loop: true,
                    nav: true,
                    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true
                });
            });
        }
    }

    function closeDesktopDrawer() {
        const drawer = document.querySelector('.amfm-desktop-drawer');
        const overlay = document.querySelector('.amfm-desktop-drawer-overlay');
        if (drawer) {
            drawer.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('visible');
        }
    }

    function isMobile() {
        return window.innerWidth <= 768; // Define mobile screen size
    }

    amfm.initOwlCarousel = function () {
        jQuery('.amfm-maps-photo-slider').each(function () {
            var $slider = jQuery(this);

            // Debug: Log if the slider has images
            // console.log('Initializing Owl Carousel for:', $slider);
            // console.log('Images found:', $slider.find('img').length);

            // Wait for images to load before initializing Owl Carousel
            $slider.imagesLoaded(function () {
                $slider.owlCarousel({
                    items: 1,
                    loop: true,
                    nav: true,
                    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true
                });

                // Debug: Log after initialization
                console.log('Owl Carousel initialized for:', $slider);
            });
        });
    };

    // Initialize Owl Carousel after InfoWindow content is rendered
    google.maps.event.addListener(infowindow, 'domready', function () {
        amfm.initOwlCarousel();
    });

    function updateInfo(count, isError = false) {
        var infoDiv = document.getElementById(unique_id + '-info');
        if (infoDiv) {
            if (isError) {
                infoDiv.innerHTML = `<div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Search Results</div>
                                        <div style="color: #666;">No locations found.</div>`;
            } else {
                infoDiv.innerHTML = `<div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Search Results</div>
                                        <div style="color: #666;">Number of pinned locations: ${count}</div>`;
            }
        }
    }

    // Update results counter
    function updateResultsCounter(count) {
        var counter = document.querySelector('#' + unique_id + '_counter');
        if (counter) {
            counter.textContent = 'Showing ' + count + ' locations';
        }
    }

    window.searchLocations = searchLocations;
    searchLocations(location_query);

    if (filter_class) {
        jQuery("." + filter_class).on("click", function () {
            // Toggle active class for the clicked filter
            jQuery(this).toggleClass("active");

            // Collect all active filters for the associated map
            let mapContainer = jQuery(this).closest(".amfm-map-container");
            let mapId = mapContainer.find(".amfm-map-control").attr("id"); // Get the map's unique ID

            if (mapId && window.amfmMaps[mapId]) {
                let mapInstance = window.amfmMaps[mapId]; // Retrieve the map instance by ID

                // Gather all active filters
                let activeFilters = [];
                let activeLocationFilters = [];

                mapContainer.find("." + filter_class + ".active").each(function () {
                    let query = jQuery(this).data("query") || ""; // Ensure query is not undefined
                    let filter = jQuery(this).data("filter") || ""; // Ensure filter is not undefined
                    let location = jQuery(this).data("location") || ""; // Get the active location filter

                    if (query || filter) {
                        activeFilters.push({ query, filter });
                    }

                    if (location) {
                        activeLocationFilters.push(location); // Collect all active location filters
                    }
                });

                // Combine all active filters into a single query and filter
                let combinedQuery = activeFilters.map(f => f.query).filter(q => q).join(" OR "); // Combine non-empty queries with "OR"
                let combinedFilter = activeFilters.map(f => f.filter).filter(f => f).join(","); // Combine non-empty filters with a comma
                let combinedLocationFilter = activeLocationFilters.join(","); // Combine all active location filters

                // Call searchLocations with combined filters and active location filter
                if (combinedQuery || combinedLocationFilter) {
                    mapInstance.searchLocations(combinedQuery, combinedFilter || null, null, combinedLocationFilter);
                } else {
                    mapInstance.searchLocations(location_query, combinedFilter || null); // Default to the original query if no active filters
                }

                console.log("Combined Query:", combinedQuery);
                console.log("Combined Filter:", combinedFilter);
                console.log("Combined Location Filter:", combinedLocationFilter);
            } else {
                console.error("Map instance not found for ID:", mapId);
            }
        });
    }
}

// AMFM Map V2 Widget JavaScript
var amfmMapV2 = {};
window.amfmMapV2 = amfmMapV2;

amfmMapV2.init = function(settings) {
    var unique_id = settings.unique_id;
    var json_data = settings.json_data;
    var api_key = settings.api_key;
    var filter_id = settings.filter_id;
    
    var map;
    var markers = [];
    var filteredData = json_data.slice(); // Copy of data for filtering
    
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
        
        console.log('Map initialized for:', unique_id);
        
        // Add a slight delay to ensure map is fully rendered
        google.maps.event.addListenerOnce(map, 'idle', function() {
            console.log('Map idle event fired, loading locations...');
            // Filter data to only include locations with PlaceID for precision
            filteredData = json_data.filter(function(location) {
                return location.PlaceID; // Only use locations with PlaceID
            });
            
            console.log('Initial load: showing', filteredData.length, 'locations with PlaceID');
            
            // Update results counter for initial load
            updateResultsCounter(filteredData.length);
            
            // Load locations initially
            loadLocations(filteredData);
            
            // Set up filter event listeners
            setupFilterListeners();
        });
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
    
    // Load locations on the map using PlaceID only
    function loadLocations(data) {
        console.log('loadLocations called with', data ? data.length : 0, 'locations');
        
        // Clear existing markers
        clearMarkers();
        
        if (!data || data.length === 0) {
            console.log('No data to load, updating counter to 0');
            updateCounter(0);
            return;
        }
        
        var bounds = new google.maps.LatLngBounds();
        var service = new google.maps.places.PlacesService(map);
        var validLocations = 0;
        var processedCount = 0;
        var totalLocations = data.filter(location => location.PlaceID).length;
        
        console.log('Total locations with PlaceID:', totalLocations);
        
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
            
            var request = {
                placeId: location.PlaceID,
                fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'opening_hours', 'formatted_phone_number', 'website']
            };
            
            service.getDetails(request, function(place, status) {
                processedCount++;
                
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name
                    });
                    
                    markers.push(marker);
                    bounds.extend(place.geometry.location);
                    validLocations++;
                    
                    // Create info window content
                    var infoContent = createInfoWindowContent(location, place);
                    var infoWindow = new google.maps.InfoWindow({
                        content: infoContent
                    });
                    
                    marker.addListener('click', function() {
                        // Close all other info windows
                        markers.forEach(function(m) {
                            if (m.infoWindow) {
                                m.infoWindow.close();
                            }
                        });
                        
                        infoWindow.open(map, marker);
                        marker.infoWindow = infoWindow;
                    });
                }
                
                // When all locations are processed, update the map view
                if (processedCount === totalLocations) {
                    updateCounter(validLocations);
                    if (!bounds.isEmpty() && validLocations > 0) {
                        map.fitBounds(bounds);
                        // Limit zoom level
                        google.maps.event.addListenerOnce(map, 'idle', function() {
                            if (map.getZoom() > 10) {
                                map.setZoom(10);
                            }
                        });
                    }
                }
            });
        });
    }
    
    // Clear all markers from the map
    function clearMarkers() {
        markers.forEach(function(marker) {
            if (marker.infoWindow) {
                marker.infoWindow.close();
            }
            marker.setMap(null);
        });
        markers = [];
    }
    
    // Create info window content
    function createInfoWindowContent(locationData, placeData) {
        var html = '<div class="amfm-map-info-window">';
        html += '<h4>' + (placeData.name || locationData['(Internal) Name'] || 'AMFM Location') + '</h4>';
        
        if (locationData.Image) {
            html += '<img src="' + locationData.Image + '" alt="Location Image" style="width: 100%; max-width: 250px; height: auto; margin: 10px 0;">';
        }
        
        if (placeData.formatted_address) {
            html += '<p><strong>Address:</strong> ' + placeData.formatted_address + '</p>';
        }
        
        if (locationData['Details: Gender']) {
            html += '<p><strong>Gender:</strong> ' + locationData['Details: Gender'] + '</p>';
        }
        
        if (locationData['(Internal) Beds']) {
            html += '<p><strong>Beds:</strong> ' + locationData['(Internal) Beds'] + '</p>';
        }
        
        if (placeData.rating) {
            html += '<p><strong>Rating:</strong> ' + placeData.rating + ' ★</p>';
        }
        
        if (locationData.URL) {
            html += '<p><a href="' + locationData.URL + '" target="_blank" style="color: #007cba; text-decoration: none;">Learn More</a></p>';
        }
        
        html += '</div>';
        return html;
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
        
        console.log('Setting up filter listeners for container:', unique_id);
        
        // Check if this map has a linked filter widget
        var filterIdAttr = container.getAttribute('data-filter-id');
        if (filterIdAttr) {
            console.log('Map is linked to external filter widget:', filterIdAttr);
            
            // Listen for filter updates from external filter widget
            container.addEventListener('amfmFilterUpdate', function(event) {
                console.log('Received filter update from external filter:', event.detail);
                var externalFilters = event.detail.filters;
                applyExternalFilters(externalFilters);
            });
            
            return; // Skip setting up internal filters if using external filter
        }
        
        // Handle button filters (internal filters only)
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
                applyFilters();
            });
        });
        
        // Add event listeners to checkboxes (for sidebar layout)
        checkboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                console.log('Checkbox changed:', checkbox.name, checkbox.value, checkbox.checked);
                applyFilters();
            });
        });
        
        // Add event listener to clear button
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                console.log('Clear button clicked');
                clearAllFilters();
            });
        }
    }
    
    // Apply external filters from filter widget
    function applyExternalFilters(externalFilters) {
        console.log('Applying external filters:', externalFilters);
        
        // Filter the data based on PlaceID precision and external filters
        filteredData = json_data.filter(function(location) {
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
        
        console.log('Filtered locations count from external filters:', filteredData.length);
        
        // Update results counter
        updateResultsCounter(filteredData.length);
        
        // Load filtered locations
        loadLocations(filteredData);
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
        
        // Filter the data based on PlaceID precision and active filters
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
        
        // Update results counter
        updateResultsCounter(filteredData.length);
        
        // Load filtered locations
        loadLocations(filteredData);
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
        
        // Update results counter
        updateResultsCounter(filteredData.length);
        
        loadLocations(filteredData);
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
        
        // Find target map widget(s)
        var mapWidgets = [];
        
        if (target_map_id) {
            // Specific target map
            var targetMap = document.getElementById(target_map_id);
            if (targetMap) {
                mapWidgets.push(target_map_id);
            }
        } else {
            // Find all AMFM map widgets on the page
            var allMapContainers = document.querySelectorAll('[id^="amfm_map_v2_"]');
            allMapContainers.forEach(function(container) {
                if (container.querySelector('.amfm-map-wrapper')) {
                    mapWidgets.push(container.id);
                }
            });
        }
        
        console.log('Found map widgets to update:', mapWidgets);
        
        // Send filter update to each map widget
        mapWidgets.forEach(function(mapId) {
            // Trigger custom event for map widget to listen to
            var event = new CustomEvent('amfmFilterUpdate', {
                detail: {
                    filters: activeFilters,
                    sourceFilterId: unique_id
                }
            });
            
            var mapContainer = document.getElementById(mapId);
            if (mapContainer) {
                mapContainer.dispatchEvent(event);
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