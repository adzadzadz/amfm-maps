<?php

namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if (!defined('ABSPATH')) {
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

        // input for filter classname
        $this->add_control(
            'filter_class',
            [
                'label' => __('Filter Class', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => 'amfm_maps_filter',
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
        $location_query = esc_js($settings['location_query']);
        $type = esc_js($settings['type']);
        $keyword = esc_js($settings['keyword']);
        $fields = json_encode(explode(',', $settings['fields']));
        $page_token = esc_js($settings['page_token']);
        $show_info = $settings['show_info'];
        $filter_class = esc_js($settings['filter_class']);

        // Generate a unique ID for this instance of the widget
        $unique_id = 'amfm_map_' . uniqid();

        $filter_script = '';
        if ($filter_class) {
            $filter_script = '
                jQuery(".' . $filter_class . '").on("click", function() {
                    let query = jQuery(this).data("query");

                    if (query) {
                        searchLocations(query);
                    }
                    
                    console.log("Filtering", query);
                });
            ';
        }

        echo '<div id="' . esc_attr($unique_id) . '" class="amfm-map-control"></div>';
        if ($show_info === 'yes') {
            echo '<div id="' . esc_attr($unique_id) . '-info" class="amfm-map-info"></div>';
        }

        echo '<script>
            function initMap' . $unique_id . '() {
                var centerPoint = { lat: 39.8283, lng: -98.5795 };
                var map = new google.maps.Map(document.getElementById("' . $unique_id . '"), {
                    center: centerPoint,
                    zoom: 4
                });

                var infowindow = new google.maps.InfoWindow();
                var bounds = new google.maps.LatLngBounds();
                var markers = [];
                var pinnedLocationsCount = 0;

                function searchLocations(location_query, nextPageToken = null) {
                    // Clear existing markers
                    markers.forEach(function(marker) {
                        marker.setMap(null);
                    });
                    markers = [];
                    bounds = new google.maps.LatLngBounds();
                    pinnedLocationsCount = 0;

                    var service = new google.maps.places.PlacesService(map);
                    var request = {
                        query: location_query,
                        type: "' . $type . '",
                        keyword: "' . $keyword . '",
                        fields: ' . $fields . ',
                        pageToken: nextPageToken || "' . $page_token . '",
                        bounds: new google.maps.LatLngBounds(
                            { lat: 24.396308, lng: -125.000000 },
                            { lat: 49.384358, lng: -66.934570 }
                        )
                    };

                    service.textSearch(request, function(results, status, pagination) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            results.forEach(function(place) {
                                if (place.geometry && place.geometry.location) {
                                    var marker = new google.maps.Marker({
                                        map: map,
                                        position: place.geometry.location,
                                        title: place.name
                                    });

                                     // Fetch full place details
                                    service.getDetails({ placeId: place.place_id, fields: ["name", "formatted_address", "formatted_phone_number", "website", "photos", "rating"] }, function(details, status) {
                                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                                            marker.addListener("click", function() {
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
                    var content = `
                        <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 300px; line-height: 1.6;">
                            
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
                    var infoDiv = document.getElementById("' . $unique_id . '-info");
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
                searchLocations("' . $location_query . '");

                ' . $filter_script . '
            }

            jQuery(document).ready(function($) {
                initMap' . $unique_id . '();
            });
        </script>';
    }
}