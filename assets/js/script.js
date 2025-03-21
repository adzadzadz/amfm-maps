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
    }

    function openDrawer(content) {
        jQuery('#amfm-drawer-content').html(content);
        jQuery('#amfm-drawer').addClass('open'); // Ensure the "open" class is added
        jQuery('#amfm-drawer-overlay').addClass('visible'); // Ensure the overlay is visible
    }

    // Expose openDrawer globally for debugging
    window.openDrawer = openDrawer;
});

var amfm = {};
window.amfm = amfm;
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

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    var markers = [];
    var pinnedLocationsCount = 0;

    function searchLocations(location_query, nextPageToken = null) {
        // Clear existing markers
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];
        bounds = new google.maps.LatLngBounds();
        pinnedLocationsCount = 0;

        var service = new google.maps.places.PlacesService(map);
        var request = {
            query: location_query,
            type: type,
            keyword: keyword,
            fields: fields,
            pageToken: nextPageToken || page_token,
            bounds: new google.maps.LatLngBounds(
                { lat: 24.396308, lng: -125.000000 },
                { lat: 49.384358, lng: -66.934570 }
            )
        };

        service.textSearch(request, function (results, status, pagination) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(function (place) {
                    if (place.geometry && place.geometry.location) {
                        var marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            title: place.name
                        });

                        // Fetch full place details
                        service.getDetails({ placeId: place.place_id, fields: ["name", "formatted_address", "formatted_phone_number", "website", "photos", "rating"] }, function (details, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                marker.addListener("click", function () {
                                    var content = generateInfoWindowContent(details);
                                    if (isMobile()) {
                                        openDrawer(content);
                                    } else {
                                        openPopup(content, marker);
                                    }
                                });
                            }
                        });

                        markers.push(marker);
                        bounds.extend(place.geometry.location);
                        pinnedLocationsCount++;
                    }
                });

                map.fitBounds(bounds);
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
                    ${place.rating ? `
                    <div style="font-size: 14px; color: #ffc107; margin-top: 5px;">
                        ${generateStars(place.rating)}
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

                // Close drawer when clicking outside the drawer
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
            console.log('Initializing Owl Carousel for:', $slider);
            console.log('Images found:', $slider.find('img').length);

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
            let query = jQuery(this).data("query");

            if (query) {
                searchLocations(query);
            }

            console.log("Filtering", query);
        });
    }
}