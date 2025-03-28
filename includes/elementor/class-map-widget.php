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
        return 'amfm_map_widget';
    }

    public function get_title()
    {
        return __('AMFM Map', 'amfm-maps');
    }

    public function get_icon()
    {
        return 'eicon-map-pin';
    }

    public function get_categories()
    {
        return ['general'];
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
                    '{{WRAPPER}}' => 'height: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .elementor-widget-container' => 'height: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-map-control' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'map_min_height',
            [
                'label' => __('Min Height', 'amfm-maps'),
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
                    '{{WRAPPER}}' => 'min-height: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .elementor-widget-container' => 'min-height: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-map-control' => 'min-height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'map_settings',
            [
                'label' => __('Map Settings', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'use_custom_locations',
            [
                'label' => __('Use Custom Locations', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'no',
            ]
        );

        $this->add_control(
            'location_sets',
            [
                'label' => __('Location Sets (Comma Separated)', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'description' => __('Specify location sets from the filters JSON (e.g., "ca, va").', 'amfm-maps'),
                'default' => '',
                'condition' => [
                    'use_custom_locations' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'filters_json',
            [
                'label' => __('Filters JSON', 'amfm-maps'),
                'type' => Controls_Manager::TEXTAREA,
                'description' => __('Input a JSON object for filters. Example: {"female_only_housing": ["Address 1", "Address 2"], "male_only_housing": ["Address 3"]}', 'amfm-maps'),
                'default' => '',
            ]
        );

        // Update the Locations Filter control to accept JSON input
        $this->add_control(
            'locations_filter',
            [
                'label' => __('Locations Filter (JSON)', 'amfm-maps'),
                'type' => Controls_Manager::TEXTAREA,
                'description' => __('Input a JSON object for locations. Example: {"ca": [{"ChIJ_boBy1Tw3IARqizwIZQSOpU": "Address 1"}], "va": [{"ChIJ133tZr1JtokRlrZJ_rkvEVI": "Address 2"}]}', 'amfm-maps'),
                'default' => '',
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
        $use_custom_locations = $settings['use_custom_locations'];
        $location_sets = esc_js($settings['location_sets']);
        $locations_filter = !empty($settings['locations_filter']) ? json_encode(json_decode($settings['locations_filter'], true)) : '{}';

        // Properly encode the filters JSON
        $filters_json = !empty($settings['filters_json']) ? json_encode(json_decode($settings['filters_json'], true)) : '{}';

        // Generate a unique ID for this instance of the widget
        $unique_id = 'amfm_map_' . uniqid();

        echo '<div id="' . esc_attr($unique_id) . '" class="amfm-map-control" data-filters-json="' . esc_attr($filters_json) . '" data-query="' . $location_query . '"></div>';
        if ($show_info === 'yes') {
            echo '<div id="' . esc_attr($unique_id) . '-info" class="amfm-map-info"></div>';
        }

        echo '<script>
            jQuery(document).ready(function($) {
                $(window).on("load", function() {
                    amfm.initMap({
                    unique_id: "' . $unique_id . '",
                    location_query: "' . $location_query . '",
                    type: "' . $type . '",
                    keyword: "' . $keyword . '",
                    fields: ' . $fields . ',
                    page_token: "' . $page_token . '",
                    show_info: "' . $show_info . '",
                    filter_class: "' . $filter_class . '",
                    use_custom_locations: "' . $use_custom_locations . '",
                    location_sets: "' . $location_sets . '",
                    filters_json: ' . $filters_json . ',
                    locations_filter: ' . $locations_filter . '
                    });
                });
            });
        </script>';
    }
}