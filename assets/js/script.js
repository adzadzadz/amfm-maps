jQuery(document).ready(function ($) {
    console.log('AMFM Maps');
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
        zoom: 4
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
                                    infowindow.setContent(content);
                                    infowindow.open(map, marker);
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

    function generateInfoWindowContent(place) {
        var photos = place.photos || [];
        var photoList = '';

        if (photos.length > 0) {
            photoList = '<div class="amfm-maps-photo-list">';
            photos.forEach(function (photo, index) {
                var photoUrl = photo.getUrl({ maxWidth: 300, maxHeight: 200 });
                photoList += `<div class="amfm-maps-photo-item">
                                <img src="${photoUrl}" alt="Photo ${index + 1}" style="width: 100%; height: auto;">
                              </div>`;
            });
            photoList += '</div>';
        }

        var content = `
            <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 300px; line-height: 1.6;">
                <!-- Name -->
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${place.name}</div>
                ${photoList}
                <!-- Address -->
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <i class="fas fa-map-marker-alt" style="color: #007BFF;"></i>
                    <span style="font-size: 14px; color: #333;">${place.formatted_address || "Address not available"}</span>
                </div>
                <!-- Located in -->
                ${place.vicinity ? `
                <div style="font-size: 13px; color: #666; margin-bottom: 10px;">
                    Located in: <strong>${place.vicinity}</strong>
                </div>` : ""}
                <!-- Opening Hours -->
                ${place.opening_hours && place.opening_hours.weekday_text ? `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <i class="far fa-clock" style="color: #28a745;"></i>
                    <span style="font-size: 14px; color: green;">${place.opening_hours.open_now ? "Open now" : "Closed"}</span>
                </div>` : ""}
                <!-- Website -->
                ${place.website ? `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    <i class="fas fa-globe" style="color: #007BFF;"></i>
                    <a href="${place.website}" target="_blank" style="font-size: 14px; color: #007BFF; text-decoration: none;">
                        ${new URL(place.website).hostname}
                    </a>
                </div>` : ""}
                <!-- Phone Number -->
                ${place.formatted_phone_number ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-phone-alt" style="color: #007BFF;"></i>
                    <a href="tel:${place.international_phone_number}" style="font-size: 14px; color: #007BFF; text-decoration: none;">
                        ${place.formatted_phone_number}
                    </a>
                </div>` : ""}
            </div>
        `;
        return content;
    }

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