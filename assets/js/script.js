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
                    <!-- Phone Number -->
                    ${place.formatted_phone_number ? `
                    <div class="phone-number-wrapper" style="font-size: 16px; color: #007BFF; margin-top: 5px;">
                        <i class="fas fa-phone-alt"></i> <a href="tel:${place.international_phone_number}" style="text-decoration: none; color: #007BFF;">${place.formatted_phone_number}</a>
                    </div>` : ""}
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