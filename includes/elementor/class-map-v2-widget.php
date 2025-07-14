<?php

namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class MapV2Widget extends Widget_Base
{
    public function get_name()
    {
        return 'amfm_map_v2_widget';
    }

    public function get_title()
    {
        return __('AMFM Map V2 (Filtered)', 'amfm-maps');
    }

    public function get_icon()
    {
        return 'eicon-map-pin';
    }

    public function get_categories()
    {
        return ['general'];
    }

    public function get_script_depends()
    {
        return ['amfm-google-maps', 'amfm-maps-script'];
    }

    public function get_style_depends()
    {
        return ['amfm-maps-style'];
    }

    protected function _register_controls()
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
            'layout_section',
            [
                'label' => __('Layout', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_responsive_control(
            'container_height',
            [
                'label' => __('Container Height', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh'],
                'range' => [
                    'px' => [
                        'min' => 400,
                        'max' => 1200,
                    ],
                    'vh' => [
                        'min' => 50,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 600,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-map-v2-container' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'filter_width',
            [
                'label' => __('Filter Panel Width', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%', 'px'],
                'range' => [
                    '%' => [
                        'min' => 20,
                        'max' => 50,
                    ],
                    'px' => [
                        'min' => 200,
                        'max' => 500,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 30,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-panel' => 'width: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-map-panel' => 'width: calc(100% - {{SIZE}}{{UNIT}});',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'filter_section',
            [
                'label' => __('Filter Settings', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'filter_layout',
            [
                'label' => __('Filter Layout', 'amfm-maps'),
                'type' => Controls_Manager::SELECT,
                'default' => 'buttons',
                'options' => [
                    'buttons' => __('Button Layout', 'amfm-maps'),
                    'sidebar' => __('Sidebar Layout', 'amfm-maps'),
                ],
            ]
        );

        $this->add_control(
            'show_location_filter',
            [
                'label' => __('Show Location Filter', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_gender_filter',
            [
                'label' => __('Show Gender Filter', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_conditions_filter',
            [
                'label' => __('Show Conditions Filter', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_programs_filter',
            [
                'label' => __('Show Programs Filter', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_accommodations_filter',
            [
                'label' => __('Show Accommodations Filter', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->end_controls_section();

        // Style controls
        $this->start_controls_section(
            'filter_style_section',
            [
                'label' => __('Filter Style', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'filter_button_bg_color',
            [
                'label' => __('Filter Button Background', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'default' => '#f8f9fa',
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_button_text_color',
            [
                'label' => __('Filter Button Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'default' => '#333',
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_button_active_bg',
            [
                'label' => __('Active Filter Background', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'default' => '#007cba',
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'filter_button_active_text',
            [
                'label' => __('Active Filter Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'default' => '#ffffff',
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'filter_button_padding',
            [
                'label' => __('Filter Button Padding', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'default' => [
                    'top' => 8,
                    'right' => 16,
                    'bottom' => 8,
                    'left' => 16,
                    'unit' => 'px',
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'filter_button_margin',
            [
                'label' => __('Filter Button Margin', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'default' => [
                    'top' => 0,
                    'right' => 8,
                    'bottom' => 8,
                    'left' => 0,
                    'unit' => 'px',
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'filter_button_border_radius',
            [
                'label' => __('Filter Button Border Radius', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', '%'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                ],
                'default' => [
                    'size' => 4,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

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
        $unique_id = 'amfm_map_v2_' . uniqid();
        $filter_layout = $settings['filter_layout'] ?? 'buttons';
        
        // Get JSON data
        $json_data = [];
        if ($settings['use_stored_data'] === 'yes') {
            $json_data = get_option('amfm_maps_json_data', []);
        } else if (!empty($settings['custom_json_data'])) {
            $json_data = json_decode($settings['custom_json_data'], true) ?: [];
        }

        // Generate filter options from the JSON data
        $filter_options = $this->generate_filter_options($json_data);
        
        ?>
        <div class="amfm-map-v2-container amfm-layout-<?php echo esc_attr($filter_layout); ?>" id="<?php echo esc_attr($unique_id); ?>">
            <?php if (!empty($settings['map_title'])): ?>
                <div class="amfm-map-title">
                    <h3><?php echo esc_html($settings['map_title']); ?></h3>
                </div>
            <?php endif; ?>
            
            <?php if ($filter_layout === 'buttons'): ?>
                <!-- Button Filter Layout -->
                <div class="amfm-map-v2-content amfm-button-layout-content">
                    <div class="amfm-filter-buttons-container">
                        <div class="amfm-filter-buttons-header">
                            <span class="amfm-filter-label"><?php echo __('Filters:', 'amfm-maps'); ?></span>
                            <button class="amfm-clear-filters amfm-filter-button" type="button">
                                <?php echo __('Clear All', 'amfm-maps'); ?>
                            </button>
                        </div>
                        
                        <div class="amfm-filter-buttons-wrapper">
                            <?php if ($settings['show_location_filter'] === 'yes' && !empty($filter_options['locations'])): ?>
                                <div class="amfm-filter-group-buttons">
                                    <span class="amfm-filter-group-title"><?php echo __('Location:', 'amfm-maps'); ?></span>
                                    <?php foreach ($filter_options['locations'] as $location): ?>
                                        <button class="amfm-filter-button" data-filter-type="location" data-filter-value="<?php echo esc_attr($location); ?>">
                                            <?php echo esc_html($location); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_gender_filter'] === 'yes' && !empty($filter_options['genders'])): ?>
                                <div class="amfm-filter-group-buttons">
                                    <span class="amfm-filter-group-title"><?php echo __('Gender:', 'amfm-maps'); ?></span>
                                    <?php foreach ($filter_options['genders'] as $gender): ?>
                                        <button class="amfm-filter-button" data-filter-type="gender" data-filter-value="<?php echo esc_attr($gender); ?>">
                                            <?php echo esc_html($gender); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_conditions_filter'] === 'yes' && !empty($filter_options['conditions'])): ?>
                                <div class="amfm-filter-group-buttons">
                                    <span class="amfm-filter-group-title"><?php echo __('Conditions:', 'amfm-maps'); ?></span>
                                    <?php foreach (array_slice($filter_options['conditions'], 0, 8) as $condition): ?>
                                        <button class="amfm-filter-button" data-filter-type="conditions" data-filter-value="<?php echo esc_attr($condition); ?>">
                                            <?php echo esc_html($condition); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_programs_filter'] === 'yes' && !empty($filter_options['programs'])): ?>
                                <div class="amfm-filter-group-buttons">
                                    <span class="amfm-filter-group-title"><?php echo __('Programs:', 'amfm-maps'); ?></span>
                                    <?php foreach (array_slice($filter_options['programs'], 0, 6) as $program): ?>
                                        <button class="amfm-filter-button" data-filter-type="programs" data-filter-value="<?php echo esc_attr($program); ?>">
                                            <?php echo esc_html($program); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_accommodations_filter'] === 'yes' && !empty($filter_options['accommodations'])): ?>
                                <div class="amfm-filter-group-buttons">
                                    <span class="amfm-filter-group-title"><?php echo __('Accommodations:', 'amfm-maps'); ?></span>
                                    <?php foreach (array_slice($filter_options['accommodations'], 0, 6) as $accommodation): ?>
                                        <button class="amfm-filter-button" data-filter-type="accommodations" data-filter-value="<?php echo esc_attr($accommodation); ?>">
                                            <?php echo esc_html($accommodation); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Map Panel for Button Layout -->
                    <div class="amfm-map-panel">
                        <div class="amfm-map-wrapper" id="<?php echo esc_attr($unique_id); ?>_map">
                            <?php if (empty($json_data)): ?>
                                <div style="padding: 20px; text-align: center; color: #666;">
                                    <p>No location data available. Please check the JSON data source.</p>
                                    <small>Using stored data: <?php echo $settings['use_stored_data'] === 'yes' ? 'Yes' : 'No'; ?></small>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="amfm-results-counter">
                            <span id="<?php echo esc_attr($unique_id); ?>_counter">
                                <?php echo sprintf(__('Showing %d locations', 'amfm-maps'), count($json_data)); ?>
                            </span>
                        </div>
                    </div>
                </div>
                
            <?php else: ?>
                <!-- Sidebar Layout (Original) -->
                <div class="amfm-map-v2-content">
                    <!-- Filter Panel -->
                    <div class="amfm-filter-panel">
                        <div class="amfm-filter-header">
                            <h4><?php echo __('Filter Locations', 'amfm-maps'); ?></h4>
                            <button class="amfm-clear-filters" type="button">
                                <?php echo __('Clear All', 'amfm-maps'); ?>
                            </button>
                        </div>
                        
                        <div class="amfm-filters-wrapper">
                            <?php if ($settings['show_location_filter'] === 'yes'): ?>
                                <div class="amfm-filter-group">
                                    <h5><?php echo __('Location', 'amfm-maps'); ?></h5>
                                    <div class="amfm-filter-options">
                                        <?php foreach ($filter_options['locations'] as $location): ?>
                                            <label class="amfm-filter-option">
                                                <input type="checkbox" name="location" value="<?php echo esc_attr($location); ?>">
                                                <span><?php echo esc_html($location); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_gender_filter'] === 'yes'): ?>
                                <div class="amfm-filter-group">
                                    <h5><?php echo __('Gender', 'amfm-maps'); ?></h5>
                                    <div class="amfm-filter-options">
                                        <?php foreach ($filter_options['genders'] as $gender): ?>
                                            <label class="amfm-filter-option">
                                                <input type="checkbox" name="gender" value="<?php echo esc_attr($gender); ?>">
                                                <span><?php echo esc_html($gender); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_conditions_filter'] === 'yes'): ?>
                                <div class="amfm-filter-group">
                                    <h5><?php echo __('Conditions Treated', 'amfm-maps'); ?></h5>
                                    <div class="amfm-filter-options amfm-scrollable">
                                        <?php foreach ($filter_options['conditions'] as $condition): ?>
                                            <label class="amfm-filter-option">
                                                <input type="checkbox" name="conditions" value="<?php echo esc_attr($condition); ?>">
                                                <span><?php echo esc_html($condition); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_programs_filter'] === 'yes'): ?>
                                <div class="amfm-filter-group">
                                    <h5><?php echo __('Programs', 'amfm-maps'); ?></h5>
                                    <div class="amfm-filter-options amfm-scrollable">
                                        <?php foreach ($filter_options['programs'] as $program): ?>
                                            <label class="amfm-filter-option">
                                                <input type="checkbox" name="programs" value="<?php echo esc_attr($program); ?>">
                                                <span><?php echo esc_html($program); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($settings['show_accommodations_filter'] === 'yes'): ?>
                                <div class="amfm-filter-group">
                                    <h5><?php echo __('Accommodations', 'amfm-maps'); ?></h5>
                                    <div class="amfm-filter-options amfm-scrollable">
                                        <?php foreach ($filter_options['accommodations'] as $accommodation): ?>
                                            <label class="amfm-filter-option">
                                                <input type="checkbox" name="accommodations" value="<?php echo esc_attr($accommodation); ?>">
                                                <span><?php echo esc_html($accommodation); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Map Panel -->
                    <div class="amfm-map-panel">
                        <div class="amfm-map-wrapper" id="<?php echo esc_attr($unique_id); ?>_map">
                            <?php if (empty($json_data)): ?>
                                <div style="padding: 20px; text-align: center; color: #666;">
                                    <p>No location data available. Please check the JSON data source.</p>
                                    <small>Using stored data: <?php echo $settings['use_stored_data'] === 'yes' ? 'Yes' : 'No'; ?></small>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="amfm-results-counter">
                            <span id="<?php echo esc_attr($unique_id); ?>_counter">
                                <?php echo sprintf(__('Showing %d locations', 'amfm-maps'), count($json_data)); ?>
                            </span>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <script>
            jQuery(document).ready(function($) {
                console.log('AMFM Map V2 Widget initializing for:', "<?php echo esc_js($unique_id); ?>");
                console.log('JSON Data count:', <?php echo count($json_data); ?>);
                
                // Ensure Google Maps API is loaded first
                function initializeMapV2() {
                    if (typeof amfmMapV2 !== 'undefined' && typeof google !== 'undefined' && google.maps) {
                        console.log('Initializing AMFM Map V2...');
                        amfmMapV2.init({
                            unique_id: "<?php echo esc_js($unique_id); ?>",
                            json_data: <?php echo json_encode($json_data); ?>,
                            api_key: "<?php echo esc_js(AMFM_MAPS_API_KEY); ?>"
                        });
                    } else {
                        console.log('Waiting for dependencies...', {
                            amfmMapV2: typeof amfmMapV2,
                            google: typeof google,
                            googleMaps: typeof google !== 'undefined' ? typeof google.maps : 'undefined'
                        });
                        // Retry after a short delay
                        setTimeout(initializeMapV2, 500);
                    }
                }
                
                // Start initialization
                $(window).on("load", function() {
                    setTimeout(initializeMapV2, 100);
                });
                
                // Also try on document ready as fallback
                initializeMapV2();
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

    private function generate_filter_options($json_data)
    {
        $options = [
            'locations' => [],
            'genders' => [],
            'conditions' => [],
            'programs' => [],
            'accommodations' => []
        ];

        if (empty($json_data)) {
            return $options;
        }

        foreach ($json_data as $location) {
            // Extract locations
            if (!empty($location['State'])) {
                $state_name = $this->get_full_state_name($location['State']);
                if (!in_array($state_name, $options['locations'])) {
                    $options['locations'][] = $state_name;
                }
            }

            // Extract genders
            if (!empty($location['Details: Gender'])) {
                $gender = $location['Details: Gender'];
                if (!in_array($gender, $options['genders'])) {
                    $options['genders'][] = $gender;
                }
            }

            // Extract conditions
            foreach ($location as $key => $value) {
                if (strpos($key, 'Conditions: ') === 0 && $value == 1) {
                    $condition = str_replace('Conditions: ', '', $key);
                    if (!in_array($condition, $options['conditions'])) {
                        $options['conditions'][] = $condition;
                    }
                }
            }

            // Extract programs
            foreach ($location as $key => $value) {
                if (strpos($key, 'Programs: ') === 0 && $value == 1) {
                    $program = str_replace('Programs: ', '', $key);
                    if (!in_array($program, $options['programs'])) {
                        $options['programs'][] = $program;
                    }
                }
            }

            // Extract accommodations
            foreach ($location as $key => $value) {
                if (strpos($key, 'Accomodations: ') === 0 && $value == 1) {
                    $accommodation = str_replace('Accomodations: ', '', $key);
                    if (!in_array($accommodation, $options['accommodations'])) {
                        $options['accommodations'][] = $accommodation;
                    }
                }
            }
        }

        // Sort all arrays
        sort($options['locations']);
        sort($options['genders']);
        sort($options['conditions']);
        sort($options['programs']);
        sort($options['accommodations']);

        return $options;
    }

    private function get_full_state_name($abbreviation)
    {
        $states = [
            'CA' => 'California',
            'VA' => 'Virginia',
            'WA' => 'Washington',
            'MN' => 'Minnesota',
            'OR' => 'Oregon'
        ];

        return isset($states[$abbreviation]) ? $states[$abbreviation] : $abbreviation;
    }
}