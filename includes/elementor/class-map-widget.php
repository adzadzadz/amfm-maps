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
        return 'amfm_map_widget';
    }

    public function get_title()
    {
        return __('AMFM Map Widget', 'amfm-maps');
    }

    public function get_icon()
    {
        return 'eicon-map';
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
                'size_units' => ['px'],
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

        echo '<div id="amfm-map" class="amfm-map-control"></div>';

        // echo a script which searches for the location query with the Google Maps API and displays the map with the pinned locations using jQuery
        // echo '<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAZLD2M_Rnz6p6d-d57bNOWggRUEC3ZmNc&loading=async&libraries=places"></script>';

        echo '<script>
            function initMap() {
                var centerPoint = { lat: 33.4402, lng: -118.0807 };
                var map = new google.maps.Map(document.getElementById("amfm-map"), {
                    center: centerPoint,
                    zoom: 14
                });

                var service = new google.maps.places.PlacesService(map);
                var infowindow = new google.maps.InfoWindow();
                var bounds = new google.maps.LatLngBounds();

                var request = {
                    query: "AMFM Mental Health Treatment",
                    fields: ["name", "geometry", "formatted_address", "photos", "rating", "opening_hours", "formatted_phone_number", "website", "vicinity", "url", "international_phone_number"]
                };

                service.textSearch(request, function (results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        results.forEach(function (place) {
                            if (place.geometry && place.geometry.location) {
                                var marker = new google.maps.Marker({
                                    map: map,
                                    position: place.geometry.location,
                                    title: place.name
                                });

                                marker.addListener("click", function () {
                                    console.log("place", place);
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
                            }
                        });

                        map.fitBounds(bounds);
                    } else {
                        console.error("No locations found: " + status);
                    }
                });
            }

            window.onload = initMap;
        </script>';

    }

}