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
        return ['amfm-maps'];
    }

    public function get_script_depends()
    {
        return ['amfm-google-maps', 'amfm-maps-script'];
    }

    public function get_style_depends()
    {
        return ['amfm-maps-style'];
    }

    protected function register_controls()
    {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Map Settings', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'map_title',
            [
                'label' => __('Map Title', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Find AMFM Locations', 'amfm-maps'),
                'label_block' => true,
            ]
        );

        $this->add_control(
            'use_stored_data',
            [
                'label' => __('Use Stored JSON Data', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
                'description' => __('Use data from amfm_maps_json_data option', 'amfm-maps'),
            ]
        );

        $this->add_control(
            'custom_json_data',
            [
                'label' => __('Custom JSON Data', 'amfm-maps'),
                'type' => Controls_Manager::TEXTAREA,
                'description' => __('Input custom JSON data if not using stored data', 'amfm-maps'),
                'default' => '',
                'condition' => [
                    'use_stored_data!' => 'yes',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'map_settings_section',
            [
                'label' => __('Map Settings', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_responsive_control(
            'map_height',
            [
                'label' => __('Map Height', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh'],
                'range' => [
                    'px' => [
                        'min' => 300,
                        'max' => 1200,
                    ],
                    'vh' => [
                        'min' => 40,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 600,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-map-wrapper' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        // Style controls
        $this->start_controls_section(
            'map_style_section',
            [
                'label' => __('Map Style', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'map_border_radius',
            [
                'label' => __('Map Border Radius', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', '%'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                ],
                'default' => [
                    'size' => 8,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-map-panel' => 'border-radius: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-map-wrapper' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'map_box_shadow',
                'label' => __('Map Box Shadow', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-map-panel',
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        
        // Use Elementor's widget ID for consistent targeting
        $widget_id = $this->get_id();
        $unique_id = 'amfm_map_' . $widget_id;
        
        // Get JSON data
        $json_data = [];
        if ($settings['use_stored_data'] === 'yes') {
            $json_data = get_option('amfm_maps_json_data', []);
        } else if (!empty($settings['custom_json_data'])) {
            $json_data = json_decode($settings['custom_json_data'], true) ?: [];
        }
        
        ?>
        <div class="amfm-map-container amfm-map-only" 
             id="<?php echo esc_attr($unique_id); ?>">
            
            <?php if (!empty($settings['map_title'])): ?>
                <div class="amfm-map-title">
                    <h3><?php echo esc_html($settings['map_title']); ?></h3>
                </div>
            <?php endif; ?>
            
            <div class="amfm-map-wrapper" id="<?php echo esc_attr($unique_id); ?>_map">
                <?php if (empty($json_data)): ?>
                    <div style="padding: 20px; text-align: center; color: #666;">
                        <p>No location data available. Please check the JSON data source.</p>
                        <small>Using stored data: <?php echo $settings['use_stored_data'] === 'yes' ? 'Yes' : 'No'; ?></small>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <script>
            jQuery(document).ready(function($) {
                console.log('AMFM Map Widget initializing for:', "<?php echo esc_js($unique_id); ?>");
                console.log('JSON Data count:', <?php echo count($json_data); ?>);
                
                // Ensure Google Maps API is loaded first
                function initializeMap() {
                    if (typeof amfmMap !== 'undefined' && typeof google !== 'undefined' && google.maps) {
                        console.log('Initializing AMFM Map...');
                        amfmMap.init({
                            unique_id: "<?php echo esc_js($unique_id); ?>",
                            json_data: <?php echo json_encode($json_data); ?>,
                            api_key: "<?php echo esc_js(AMFM_MAPS_API_KEY); ?>"
                        });
                    } else {
                        console.log('Waiting for dependencies...', {
                            amfmMap: typeof amfmMap,
                            google: typeof google,
                            googleMaps: typeof google !== 'undefined' ? typeof google.maps : 'undefined'
                        });
                        // Retry after a short delay
                        setTimeout(initializeMapV2, 500);
                    }
                }
                
                // Start initialization
                $(window).on("load", function() {                        setTimeout(initializeMap, 100);
                });
                
                // Also try on document ready as fallback
                initializeMap();
            });
        </script>
        
        <?php
        // Ensure scripts are enqueued for this page
        $this->enqueue_map_scripts();
    }
    
    private function enqueue_map_scripts()
    {
        // Force enqueue scripts if not already done
        if (!wp_script_is('amfm-google-maps', 'enqueued')) {
            wp_enqueue_script('amfm-google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . AMFM_MAPS_API_KEY . '&loading=async&libraries=places', [], null, false);
        }
        
        if (!wp_style_is('amfm-maps-style', 'enqueued')) {
            wp_enqueue_style('amfm-maps-style', plugins_url('../../assets/css/style.css', __FILE__), [], AMFM_MAPS_VERSION);
        }
        
        if (!wp_script_is('amfm-maps-script', 'enqueued')) {
            wp_enqueue_script('amfm-maps-script', plugins_url('../../assets/js/script.js', __FILE__), ['jquery', 'amfm-google-maps'], AMFM_MAPS_VERSION, true);
        }
    }
}