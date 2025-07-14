<?php

namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * AMFM Map V2 Filter Widget
 *
 * Elementor widget for AMFM Map V2 filters only.
 */
class MapV2FilterWidget extends Widget_Base
{

    /**
     * Retrieve the widget name.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return string Widget name.
     */
    public function get_name()
    {
        return 'amfm_map_v2_filter';
    }

    /**
     * Retrieve the widget title.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return string Widget title.
     */
    public function get_title()
    {
        return __('AMFM Map V2 Filter', 'amfm-maps');
    }

    /**
     * Retrieve the widget icon.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return string Widget icon.
     */
    public function get_icon()
    {
        return 'eicon-filter';
    }

    /**
     * Retrieve the list of categories the widget belongs to.
     *
     * Used to determine where to display the widget in the editor.
     *
     * Note that currently Elementor supports only one category.
     * When multiple categories passed, Elementor uses the first one.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return array Widget categories.
     */
    public function get_categories()
    {
        return ['amfm-maps'];
    }

    /**
     * Retrieve the list of scripts the widget depended on.
     *
     * Used to set scripts dependencies required to run the widget.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return array Widget scripts dependencies.
     */
    public function get_script_depends()
    {
        return ['amfm-maps-script'];
    }

    /**
     * Retrieve the list of styles the widget depended on.
     *
     * Used to set style dependencies required to run the widget.
     *
     * @since 1.0.0
     *
     * @access public
     *
     * @return array Widget style dependencies.
     */
    public function get_style_depends()
    {
        return ['amfm-maps-style'];
    }

    /**
     * Register the widget controls.
     *
     * Adds different input fields to allow the user to change and customize the widget settings.
     *
     * @since 1.0.0
     *
     * @access protected
     */
    protected function register_controls()
    {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Filter Settings', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'filter_title',
            [
                'label' => __('Filter Title', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Filter Locations', 'amfm-maps'),
                'placeholder' => __('Enter filter title', 'amfm-maps'),
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
            'use_stored_data',
            [
                'label' => __('Use Stored Data', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'yes',
                'description' => __('Use JSON data stored in WordPress options', 'amfm-maps'),
            ]
        );

        $this->add_control(
            'custom_json_data',
            [
                'label' => __('Custom JSON Data', 'amfm-maps'),
                'type' => Controls_Manager::TEXTAREA,
                'rows' => 10,
                'placeholder' => __('Enter JSON data here...', 'amfm-maps'),
                'condition' => [
                    'use_stored_data' => '',
                ],
            ]
        );

        $this->add_control(
            'target_map_id',
            [
                'label' => __('Target Map Widget ID', 'amfm-maps'),
                'type' => Controls_Manager::TEXT,
                'description' => __('Enter the unique ID of the map widget to filter. Leave empty to target any AMFM map on the page.', 'amfm-maps'),
                'placeholder' => __('amfm_map_v2_123456', 'amfm-maps'),
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'filter_toggles_section',
            [
                'label' => __('Filter Categories', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
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

        // Style Controls
        $this->start_controls_section(
            'filter_button_style',
            [
                'label' => __('Filter Buttons', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
                'condition' => [
                    'filter_layout' => 'buttons',
                ],
            ]
        );

        $this->add_control(
            'button_background_color',
            [
                'label' => __('Background Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'background-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'button_text_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'button_hover_background_color',
            [
                'label' => __('Hover Background Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button:hover' => 'background-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'button_active_background_color',
            [
                'label' => __('Active Background Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'background-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'button_active_text_color',
            [
                'label' => __('Active Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_padding',
            [
                'label' => __('Padding', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_margin',
            [
                'label' => __('Margin', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'button_border_radius',
            [
                'label' => __('Border Radius', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'filter_container_style',
            [
                'label' => __('Filter Container', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'container_background_color',
            [
                'label' => __('Background Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'background-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'container_padding',
            [
                'label' => __('Padding', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Border::get_type(),
            [
                'name' => 'container_border',
                'label' => __('Border', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-container',
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Render the widget output on the frontend.
     *
     * Written in PHP and used to generate the final HTML.
     *
     * @since 1.0.0
     *
     * @access protected
     */
    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $unique_id = 'amfm_filter_v2_' . uniqid();
        $filter_layout = $settings['filter_layout'] ?? 'buttons';
        $target_map_id = $settings['target_map_id'] ?? '';
        
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
        <div class="amfm-filter-container amfm-layout-<?php echo esc_attr($filter_layout); ?>" 
             id="<?php echo esc_attr($unique_id); ?>"
             data-target-map="<?php echo esc_attr($target_map_id); ?>">
            
            <?php if (!empty($settings['filter_title'])): ?>
                <div class="amfm-filter-title">
                    <h3><?php echo esc_html($settings['filter_title']); ?></h3>
                </div>
            <?php endif; ?>
            
            <?php if ($filter_layout === 'buttons'): ?>
                <!-- Button Filter Layout -->
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
                
            <?php else: ?>
                <!-- Sidebar Layout -->
                <div class="amfm-filter-panel">
                    <div class="amfm-filter-header">
                        <h4><?php echo __('Filter Locations', 'amfm-maps'); ?></h4>
                        <button class="amfm-clear-filters" type="button">
                            <?php echo __('Clear All', 'amfm-maps'); ?>
                        </button>
                    </div>
                    
                    <div class="amfm-filters-wrapper">
                        <?php if ($settings['show_location_filter'] === 'yes' && !empty($filter_options['locations'])): ?>
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

                        <?php if ($settings['show_gender_filter'] === 'yes' && !empty($filter_options['genders'])): ?>
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

                        <?php if ($settings['show_conditions_filter'] === 'yes' && !empty($filter_options['conditions'])): ?>
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

                        <?php if ($settings['show_programs_filter'] === 'yes' && !empty($filter_options['programs'])): ?>
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

                        <?php if ($settings['show_accommodations_filter'] === 'yes' && !empty($filter_options['accommodations'])): ?>
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
            <?php endif; ?>
        </div>

        <script>
            jQuery(document).ready(function($) {
                // Initialize filter widget
                function initializeFilter() {
                    if (typeof amfmMapV2Filter !== 'undefined') {
                        console.log('Initializing AMFM Filter V2...');
                        amfmMapV2Filter.init({
                            unique_id: "<?php echo esc_js($unique_id); ?>",
                            target_map_id: "<?php echo esc_js($target_map_id); ?>",
                            json_data: <?php echo json_encode($json_data); ?>
                        });
                    } else {
                        console.log('Waiting for amfmMapV2Filter...');
                        setTimeout(initializeFilter, 500);
                    }
                }
                
                // Start initialization
                initializeFilter();
            });
        </script>
        
        <?php
        // Ensure scripts are enqueued for this page
        $this->enqueue_filter_scripts();
    }
    
    private function enqueue_filter_scripts()
    {
        // Force enqueue scripts if not already done
        if (!wp_style_is('amfm-maps-style', 'enqueued')) {
            wp_enqueue_style('amfm-maps-style', plugins_url('../../assets/css/style.css', __FILE__), [], AMFM_MAPS_VERSION);
        }
        
        if (!wp_script_is('amfm-maps-script', 'enqueued')) {
            wp_enqueue_script('amfm-maps-script', plugins_url('../../assets/js/script.js', __FILE__), ['jquery'], AMFM_MAPS_VERSION, true);
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
        return $states[$abbreviation] ?? $abbreviation;
    }
}
