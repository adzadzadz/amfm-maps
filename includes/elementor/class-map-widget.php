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

        echo '<div id="' . esc_attr($unique_id) . '" class="amfm-map-control"></div>';
        if ($show_info === 'yes') {
            echo '<div id="' . esc_attr($unique_id) . '-info" class="amfm-map-info"></div>';
        }

        echo '<script>
            jQuery(document).ready(function($) {
                amfm.initMap({
                    unique_id: "' . $unique_id . '",
                    location_query: "' . $location_query . '",
                    type: "' . $type . '",
                    keyword: "' . $keyword . '",
                    fields: ' . $fields . ',
                    page_token: "' . $page_token . '",
                    show_info: "' . $show_info . '",
                    filter_class: "' . $filter_class . '"
                });
            });
        </script>';
    }
}