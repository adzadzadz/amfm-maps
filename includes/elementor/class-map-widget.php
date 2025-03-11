<?php

namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;
use Elementor\Repeater;
use Elementor\Controls_Manager;

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class MapWidget extends Widget_Base
{

    public function get_name()
    {
        return 'amfm_maps';
    }

    public function get_title()
    {
        return __('AMFM Map', 'amfm-maps');
    }

    public function get_icon()
    {
        return 'eicon-google-maps';
    }

    public function get_categories()
    {
        return ['basic'];
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Content', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        // input for Location Query
        $this->add_control(
            'location_query',
            [
                'label' => __('Location Query', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => __('AMFM Mental Health Treatment', 'amfm-maps'),
                'label_block' => true,
            ]
        );

        // input for Location
        $this->add_control(
            'location',
            [
                'label' => __('Location', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => '39.8283,-98.5795', // Geographic center of the US
                'label_block' => true,
            ]
        );

        // input for Radius
        $this->add_control(
            'radius',
            [
                'label' => __('Radius (meters)', 'amfm-maps'),
                'type' => Controls_Manager::NUMBER,
                'default' => 5000,
            ]
        );

        // input for Type
        $this->add_control(
            'type',
            [
                'label' => __('Type', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'label_block' => true,
            ]
        );

        // input for Keyword
        $this->add_control(
            'keyword',
            [
                'label' => __('Keyword', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'label_block' => true,
            ]
        );

        // input for Fields
        $this->add_control(
            'fields',
            [
                'label' => __('Fields', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => 'name,geometry,formatted_address,photos,rating,opening_hours,formatted_phone_number,website,vicinity,url,international_phone_number',
                'label_block' => true,
            ]
        );

        // input for PageToken
        $this->add_control(
            'page_token',
            [
                'label' => __('Page Token', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'label_block' => true,
            ]
        );

        // input for Show Info
        $this->add_control(
            'show_info',
            [
                'label' => __('Show Info', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'layout_section',
            [
                'label' => __('Layout', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_responsive_control(
            'map_width',
            [
                'label' => __('Width', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%', 'px'],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                    'px' => [
                        'min' => 0,
                        'max' => 1200,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-map-control' => 'width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'map_height',
            [
                'label' => __('Height', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%', 'px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1200,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 300,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-map-control' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $location_query = $settings['location_query'];
        $location = explode(',', $settings['location']);
        $radius = $settings['radius'];
        $type = $settings['type'];
        $keyword = $settings['keyword'];
        $fields = explode(',', $settings['fields']);
        $bounds = explode(',', $settings['bounds']);
        $page_token = $settings['page_token'];
        $show_info = $settings['show_info'];

        // Generate a unique ID for this instance of the widget
        $unique_id = 'amfm_map_' . uniqid();

        echo '<div id="' . esc_attr($unique_id) . '" class="amfm-map-control"></div>';
        if ($show_info === 'yes') {
            echo '<div id="' . esc_attr($unique_id) . '-info" style="font-family: Arial, sans-serif; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; margin-top: 10px;"></div>';
        }

        echo '<script>
            function initMap' . esc_js($unique_id) . '() {
                var centerPoint = { lat: ' . esc_js($location[0]) . ', lng: ' . esc_js($location[1]) . ' };
                var map = new google.maps.Map(document.getElementById("' . esc_js($unique_id) . '"), {
                    center: centerPoint,
                    zoom: 4
                });

                var service = new google.maps.places.PlacesService(map);
                var infowindow = new google.maps.InfoWindow();
                var bounds = new google.maps.LatLngBounds();
                var pinnedLocationsCount = 0;

                function searchLocations(nextPageToken = null) {
                    var request = {
                        query: "' . esc_js($location_query) . '",
                        location: centerPoint,
                        radius: ' . esc_js($radius) . ',
                        type: "' . esc_js($type) . '",
                        keyword: "' . esc_js($keyword) . '",
                        fields: ' . json_encode($fields) . ',
                        pageToken: nextPageToken || "' . esc_js($page_token) . '",
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

                                    marker.addListener("click", function () {
                                        var content = `
                                            <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 250px;">
                                                ${(place.photos && place.photos.length > 0) ? `
                                                <div style="margin-bottom: 10px;">
                                                    <img src="${place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 })}" 
                                                        alt="${place.name}" 
                                                        style="width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
                                                </div>` : ``}

                                                <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${place.name}</div>
                                                <div style="color: #666; margin-bottom: 10px;">${place.formatted_address}</div>

                                                ${(place.rating) ? `
                                                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                                                    ⭐ <span>${place.rating}</span>
                                                </div>` : ``}

                                                ${(place.opening_hours && place.opening_hours.weekday_text) ? `
                                                <div style="margin-bottom: 10px;">
                                                    <strong>Opening Hours:</strong>
                                                    ${place.opening_hours.weekday_text.map(hour => `<div style="color: #666;">${hour}</div>`).join(``)}
                                                </div>` : ``}

                                                ${(place.formatted_phone_number) ? `
                                                <div><strong>Phone:</strong> ${place.formatted_phone_number}</div>` : ``}

                                                ${(place.website) ? `
                                                <div>
                                                    <strong>Website:</strong> 
                                                    <a href="${place.website}" target="_blank" style="color: #1a73e8; text-decoration: none;">
                                                        ${place.website.replace(/^https?:\/\//, ``)}
                                                    </a>
                                                </div>` : ``}
                                            </div>
                                        `;

                                        infowindow.setContent(content);
                                        infowindow.open(map, marker);
                                    });

                                    bounds.extend(place.geometry.location);
                                    pinnedLocationsCount++;
                                }
                            });

                            map.fitBounds(bounds);

                            // Update the info div with the number of pinned locations
                            if (document.getElementById("' . esc_js($unique_id) . '-info")) {
                                document.getElementById("' . esc_js($unique_id) . '-info").innerHTML = `
                                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Search Results</div>
                                    <div style="color: #666;">Number of pinned locations: ${pinnedLocationsCount}</div>
                                `;
                            }

                            // Handle pagination (if there are more results)
                            if (pagination && pagination.hasNextPage) {
                                setTimeout(() => pagination.nextPage(), 2000); // Delay to avoid quota issues
                            }
                        } else {
                            console.error("No locations found: " + status);
                            if (document.getElementById("' . esc_js($unique_id) . '-info")) {
                                document.getElementById("' . esc_js($unique_id) . '-info").innerHTML = `
                                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Search Results</div>
                                    <div style="color: #666;">No locations found.</div>
                                `;
                            }
                        }
                    });
                }

                searchLocations();
            }

            // Initialize the map when the window loads
            window.onload = initMap' . esc_js($unique_id) . ';

            // Initialize the map when the Elementor editor is loaded or updated
            jQuery(window).on("elementor/frontend/init", function () {
                elementorFrontend.hooks.addAction("frontend/element_ready/amfm_maps.default", function () {
                    initMap' . esc_js($unique_id) . '();
                });
            });
        </script>';
    }

}