<?php

namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * AMFM Map Filter Widget
 *
 * Elementor widget for AMFM Map filters only.
 */
class MapFilterWidget extends Widget_Base
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
        return 'amfm_map_filter';
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
        return __('AMFM Map Filter', 'amfm-maps');
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
                'description' => __('Enter the Elementor widget ID of the map widget to filter (e.g., "1a2b3c4d"). You can find this in the Navigator panel. Leave empty to target all AMFM maps on the page.', 'amfm-maps'),
                'placeholder' => __('1a2b3c4d', 'amfm-maps'),
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

        // Icons Section
        $this->start_controls_section(
            'filter_icons_section',
            [
                'label' => __('Filter Icons', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_CONTENT,
                'condition' => [
                    'filter_layout' => 'buttons',
                ],
            ]
        );

        $this->add_control(
            'show_icons',
            [
                'label' => __('Show Icons', 'amfm-maps'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'amfm-maps'),
                'label_off' => __('No', 'amfm-maps'),
                'return_value' => 'yes',
                'default' => 'no',
            ]
        );

        $this->add_control(
            'icon_position',
            [
                'label' => __('Icon Position', 'amfm-maps'),
                'type' => Controls_Manager::SELECT,
                'default' => 'left',
                'options' => [
                    'left' => __('Left', 'amfm-maps'),
                    'right' => __('Right', 'amfm-maps'),
                    'top' => __('Top', 'amfm-maps'),
                    'bottom' => __('Bottom', 'amfm-maps'),
                ],
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'location_icon',
            [
                'label' => __('Location Icon', 'amfm-maps'),
                'type' => Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-map-marker-alt',
                    'library' => 'fa-solid',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                    'show_location_filter' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'gender_icon',
            [
                'label' => __('Gender Icon', 'amfm-maps'),
                'type' => Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-user',
                    'library' => 'fa-solid',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                    'show_gender_filter' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'conditions_icon',
            [
                'label' => __('Conditions Icon', 'amfm-maps'),
                'type' => Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-stethoscope',
                    'library' => 'fa-solid',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                    'show_conditions_filter' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'programs_icon',
            [
                'label' => __('Programs Icon', 'amfm-maps'),
                'type' => Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-clipboard-list',
                    'library' => 'fa-solid',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                    'show_programs_filter' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'accommodations_icon',
            [
                'label' => __('Accommodations Icon', 'amfm-maps'),
                'type' => Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-bed',
                    'library' => 'fa-solid',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                    'show_accommodations_filter' => 'yes',
                ],
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

        // Button Typography
        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'button_typography',
                'label' => __('Typography', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-button',
            ]
        );

        // Button Size
        $this->add_responsive_control(
            'button_size',
            [
                'label' => __('Button Size', 'amfm-maps'),
                'type' => Controls_Manager::SELECT,
                'default' => 'medium',
                'options' => [
                    'small' => __('Small', 'amfm-maps'),
                    'medium' => __('Medium', 'amfm-maps'),
                    'large' => __('Large', 'amfm-maps'),
                    'custom' => __('Custom', 'amfm-maps'),
                ],
            ]
        );

        $this->add_responsive_control(
            'button_width',
            [
                'label' => __('Width', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', '%', 'em'],
                'range' => [
                    'px' => [
                        'min' => 50,
                        'max' => 500,
                    ],
                    '%' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                    'em' => [
                        'min' => 3,
                        'max' => 30,
                    ],
                ],
                'condition' => [
                    'button_size' => 'custom',
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_height',
            [
                'label' => __('Height', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'em'],
                'range' => [
                    'px' => [
                        'min' => 20,
                        'max' => 100,
                    ],
                    'em' => [
                        'min' => 1,
                        'max' => 6,
                    ],
                ],
                'condition' => [
                    'button_size' => 'custom',
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        // Button Normal State
        $this->add_control(
            'button_normal_heading',
            [
                'label' => __('Normal State', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
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

        $this->add_group_control(
            \Elementor\Group_Control_Background::get_type(),
            [
                'name' => 'button_background',
                'label' => __('Background', 'amfm-maps'),
                'types' => ['classic', 'gradient'],
                'selector' => '{{WRAPPER}} .amfm-filter-button',
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Border::get_type(),
            [
                'name' => 'button_border',
                'label' => __('Border', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-button',
            ]
        );

        $this->add_responsive_control(
            'button_border_radius',
            [
                'label' => __('Border Radius', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'button_box_shadow',
                'label' => __('Box Shadow', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-button',
            ]
        );

        // Button Hover State
        $this->add_control(
            'button_hover_heading',
            [
                'label' => __('Hover State', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'button_hover_text_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button:hover' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Background::get_type(),
            [
                'name' => 'button_hover_background',
                'label' => __('Background', 'amfm-maps'),
                'types' => ['classic', 'gradient'],
                'selector' => '{{WRAPPER}} .amfm-filter-button:hover',
            ]
        );

        $this->add_control(
            'button_hover_border_color',
            [
                'label' => __('Border Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button:hover' => 'border-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'button_hover_box_shadow',
                'label' => __('Box Shadow', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-button:hover',
            ]
        );

        $this->add_control(
            'button_hover_transition',
            [
                'label' => __('Transition Duration', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['ms'],
                'range' => [
                    'ms' => [
                        'min' => 0,
                        'max' => 3000,
                        'step' => 100,
                    ],
                ],
                'default' => [
                    'unit' => 'ms',
                    'size' => 300,
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button' => 'transition: all {{SIZE}}{{UNIT}} ease-in-out;',
                ],
            ]
        );

        // Button Active State
        $this->add_control(
            'button_active_heading',
            [
                'label' => __('Active State', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'button_active_text_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Background::get_type(),
            [
                'name' => 'button_active_background',
                'label' => __('Background', 'amfm-maps'),
                'types' => ['classic', 'gradient'],
                'selector' => '{{WRAPPER}} .amfm-filter-button.active',
            ]
        );

        $this->add_control(
            'button_active_border_color',
            [
                'label' => __('Border Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active' => 'border-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'button_active_box_shadow',
                'label' => __('Box Shadow', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-button.active',
            ]
        );

        // Button Spacing
        $this->add_control(
            'button_spacing_heading',
            [
                'label' => __('Spacing', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
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

        $this->add_responsive_control(
            'button_gap',
            [
                'label' => __('Gap Between Buttons', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'em'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                    'em' => [
                        'min' => 0,
                        'max' => 3,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-buttons-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        // Icon Styling
        $this->add_control(
            'button_icon_heading',
            [
                'label' => __('Icon Styling', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_icon_size',
            [
                'label' => __('Icon Size', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'em'],
                'range' => [
                    'px' => [
                        'min' => 10,
                        'max' => 50,
                    ],
                    'em' => [
                        'min' => 0.5,
                        'max' => 3,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button i' => 'font-size: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-button svg' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'button_icon_color',
            [
                'label' => __('Icon Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button i' => 'color: {{VALUE}}',
                    '{{WRAPPER}} .amfm-filter-button svg' => 'fill: {{VALUE}}',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'button_icon_hover_color',
            [
                'label' => __('Icon Hover Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button:hover i' => 'color: {{VALUE}}',
                    '{{WRAPPER}} .amfm-filter-button:hover svg' => 'fill: {{VALUE}}',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'button_icon_active_color',
            [
                'label' => __('Icon Active Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.active i' => 'color: {{VALUE}}',
                    '{{WRAPPER}} .amfm-filter-button.active svg' => 'fill: {{VALUE}}',
                ],
                'condition' => [
                    'show_icons' => 'yes',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_icon_spacing',
            [
                'label' => __('Icon Spacing', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'em'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 30,
                    ],
                    'em' => [
                        'min' => 0,
                        'max' => 2,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-button.icon-left i, {{WRAPPER}} .amfm-filter-button.icon-left svg' => 'margin-right: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-button.icon-right i, {{WRAPPER}} .amfm-filter-button.icon-right svg' => 'margin-left: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-button.icon-top i, {{WRAPPER}} .amfm-filter-button.icon-top svg' => 'margin-bottom: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-button.icon-bottom i, {{WRAPPER}} .amfm-filter-button.icon-bottom svg' => 'margin-top: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-button.icon-top, {{WRAPPER}} .amfm-filter-button.icon-bottom' => 'flex-direction: column;',
                    '{{WRAPPER}} .amfm-filter-button.icon-right' => 'flex-direction: row-reverse;',
                    '{{WRAPPER}} .amfm-filter-button' => 'display: flex; align-items: center; justify-content: center;',
                ],
                'condition' => [
                    'show_icons' => 'yes',
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

        // Container Typography
        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'container_typography',
                'label' => __('Typography', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-container',
            ]
        );

        // Container Size
        $this->add_responsive_control(
            'container_width',
            [
                'label' => __('Width', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', '%', 'vw'],
                'range' => [
                    'px' => [
                        'min' => 200,
                        'max' => 1200,
                    ],
                    '%' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                    'vw' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'container_max_width',
            [
                'label' => __('Max Width', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', '%', 'vw'],
                'range' => [
                    'px' => [
                        'min' => 200,
                        'max' => 1400,
                    ],
                    '%' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                    'vw' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'max-width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'container_height',
            [
                'label' => __('Height', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh'],
                'range' => [
                    'px' => [
                        'min' => 100,
                        'max' => 800,
                    ],
                    'vh' => [
                        'min' => 10,
                        'max' => 100,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        // Container Appearance
        $this->add_control(
            'container_appearance_heading',
            [
                'label' => __('Appearance', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'container_text_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Background::get_type(),
            [
                'name' => 'container_background',
                'label' => __('Background', 'amfm-maps'),
                'types' => ['classic', 'gradient'],
                'selector' => '{{WRAPPER}} .amfm-filter-container',
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

        $this->add_responsive_control(
            'container_border_radius',
            [
                'label' => __('Border Radius', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'container_box_shadow',
                'label' => __('Box Shadow', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-container',
            ]
        );

        // Container Spacing
        $this->add_control(
            'container_spacing_heading',
            [
                'label' => __('Spacing', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
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

        $this->add_responsive_control(
            'container_margin',
            [
                'label' => __('Margin', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-container' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        // Filter Group Title Styling
        $this->start_controls_section(
            'filter_group_title_style',
            [
                'label' => __('Filter Group Titles', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'group_title_typography',
                'label' => __('Typography', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-group-title, {{WRAPPER}} .amfm-filter-group h5',
            ]
        );

        $this->add_control(
            'group_title_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-group-title' => 'color: {{VALUE}}',
                    '{{WRAPPER}} .amfm-filter-group h5' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'group_title_margin',
            [
                'label' => __('Margin', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-group-title' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                    '{{WRAPPER}} .amfm-filter-group h5' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        // Filter Title Styling
        $this->start_controls_section(
            'filter_title_style',
            [
                'label' => __('Filter Title', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
                'condition' => [
                    'filter_title!' => '',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'filter_title_typography',
                'label' => __('Typography', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-title h3',
            ]
        );

        $this->add_control(
            'filter_title_color',
            [
                'label' => __('Text Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-title h3' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'filter_title_alignment',
            [
                'label' => __('Alignment', 'amfm-maps'),
                'type' => Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => __('Left', 'amfm-maps'),
                        'icon' => 'eicon-text-align-left',
                    ],
                    'center' => [
                        'title' => __('Center', 'amfm-maps'),
                        'icon' => 'eicon-text-align-center',
                    ],
                    'right' => [
                        'title' => __('Right', 'amfm-maps'),
                        'icon' => 'eicon-text-align-right',
                    ],
                ],
                'default' => 'left',
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-title' => 'text-align: {{VALUE}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'filter_title_margin',
            [
                'label' => __('Margin', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-title' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        // Sidebar Layout Specific Styles
        $this->start_controls_section(
            'sidebar_layout_style',
            [
                'label' => __('Sidebar Layout', 'amfm-maps'),
                'tab' => Controls_Manager::TAB_STYLE,
                'condition' => [
                    'filter_layout' => 'sidebar',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Background::get_type(),
            [
                'name' => 'sidebar_background',
                'label' => __('Sidebar Background', 'amfm-maps'),
                'types' => ['classic', 'gradient'],
                'selector' => '{{WRAPPER}} .amfm-filter-panel',
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Border::get_type(),
            [
                'name' => 'sidebar_border',
                'label' => __('Sidebar Border', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-panel',
            ]
        );

        $this->add_responsive_control(
            'sidebar_padding',
            [
                'label' => __('Sidebar Padding', 'amfm-maps'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-panel' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        // Checkbox Styling
        $this->add_control(
            'checkbox_styling_heading',
            [
                'label' => __('Checkbox Styling', 'amfm-maps'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'checkbox_color',
            [
                'label' => __('Checkbox Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-option input[type="checkbox"]' => 'accent-color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'checkbox_size',
            [
                'label' => __('Checkbox Size', 'amfm-maps'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 12,
                        'max' => 24,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-option input[type="checkbox"]' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'checkbox_label_typography',
                'label' => __('Label Typography', 'amfm-maps'),
                'selector' => '{{WRAPPER}} .amfm-filter-option span',
            ]
        );

        $this->add_control(
            'checkbox_label_color',
            [
                'label' => __('Label Color', 'amfm-maps'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .amfm-filter-option span' => 'color: {{VALUE}}',
                ],
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

        // Use Elementor's widget ID for consistent targeting
        $widget_id = $this->get_id();
        $unique_id = 'amfm_filter_' . $widget_id;
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

        // Get filter configuration for labels and enabled status
        $filter_config = \Amfm_Maps_Admin::get_filter_config();

        // Get icon settings
        $show_icons = $settings['show_icons'] === 'yes';
        $icon_position = $settings['icon_position'] ?? 'left';
        $button_size = $settings['button_size'] ?? 'medium';

        // Build button classes
        $button_classes = ['amfm-filter-button'];
        if ($show_icons) {
            $button_classes[] = 'icon-' . $icon_position;
        }
        if ($button_size !== 'custom') {
            $button_classes[] = 'size-' . $button_size;
        }
        $button_class_string = implode(' ', $button_classes);

        // Icon map
        $filter_icons = [
            'location' => $settings['location_icon'] ?? [],
            'gender' => $settings['gender_icon'] ?? [],
            'conditions' => $settings['conditions_icon'] ?? [],
            'programs' => $settings['programs_icon'] ?? [],
            'accommodations' => $settings['accommodations_icon'] ?? [],
        ];

?>
        <div class="amfm-filter-container amfm-filter-only amfm-layout-<?php echo esc_attr($filter_layout); ?>"
            id="<?php echo esc_attr($unique_id); ?>"
            data-target-map="<?php echo esc_attr($target_map_id); ?>">

            <?php if (!empty($settings['filter_title'])): ?>
                <div class="amfm-filter-title">
                    <h3><?php echo esc_html($settings['filter_title']); ?></h3>
                </div>
            <?php endif; ?>

            <!-- Button Filter Layout -->
            <div class="amfm-filter-buttons-container">
                <div class="amfm-filter-buttons-wrapper">
                    <?php if ($filter_config['location']['enabled'] && !empty($filter_options['location'])): ?>
                        <div class="amfm-filter-group-buttons">
                            <span class="amfm-filter-group-title">
                                <?php if ($show_icons && !empty($filter_icons['location']['value'])): ?>
                                    <?php \Elementor\Icons_Manager::render_icon($filter_icons['location'], ['aria-hidden' => 'true']); ?>
                                <?php endif; ?>
                                <?php echo esc_html($filter_config['location']['label'] ?? __('Location:', 'amfm-maps')); ?>
                            </span>
                            <?php foreach ($filter_options['location'] as $location): ?>
                                <button class="<?php echo esc_attr($button_class_string); ?>" data-filter-type="location" data-filter-value="<?php echo esc_attr($location); ?>">
                                    <?php if ($show_icons && !empty($filter_icons['location']['value']) && in_array($icon_position, ['left', 'top'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['location'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                    <?php echo esc_html($location); ?>
                                    <?php if ($show_icons && !empty($filter_icons['location']['value']) && in_array($icon_position, ['right', 'bottom'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['location'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($filter_config['gender']['enabled'] && !empty($filter_options['gender'])): ?>
                        <div class="amfm-filter-group-buttons">
                            <span class="amfm-filter-group-title">
                                <?php if ($show_icons && !empty($filter_icons['gender']['value'])): ?>
                                    <?php \Elementor\Icons_Manager::render_icon($filter_icons['gender'], ['aria-hidden' => 'true']); ?>
                                <?php endif; ?>
                                <?php echo esc_html($filter_config['gender']['label'] ?? __('Gender:', 'amfm-maps')); ?>
                            </span>
                            <?php foreach ($filter_options['gender'] as $gender): ?>
                                <button class="<?php echo esc_attr($button_class_string); ?>" data-filter-type="gender" data-filter-value="<?php echo esc_attr($gender); ?>">
                                    <?php if ($show_icons && !empty($filter_icons['gender']['value']) && in_array($icon_position, ['left', 'top'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['gender'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                    <?php echo esc_html($gender); ?>
                                    <?php if ($show_icons && !empty($filter_icons['gender']['value']) && in_array($icon_position, ['right', 'bottom'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['gender'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($filter_config['conditions']['enabled'] && !empty($filter_options['conditions'])): ?>
                        <div class="amfm-filter-group-buttons">
                            <span class="amfm-filter-group-title">
                                <?php if ($show_icons && !empty($filter_icons['conditions']['value'])): ?>
                                    <?php \Elementor\Icons_Manager::render_icon($filter_icons['conditions'], ['aria-hidden' => 'true']); ?>
                                <?php endif; ?>
                                <?php echo esc_html($filter_config['conditions']['label'] ?? __('Conditions:', 'amfm-maps')); ?>
                            </span>
                            <?php foreach ($filter_options['conditions'] as $condition): ?>
                                <button class="<?php echo esc_attr($button_class_string); ?>" data-filter-type="conditions" data-filter-value="<?php echo esc_attr($condition); ?>">
                                    <?php if ($show_icons && !empty($filter_icons['conditions']['value']) && in_array($icon_position, ['left', 'top'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['conditions'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                    <?php echo esc_html($condition); ?>
                                    <?php if ($show_icons && !empty($filter_icons['conditions']['value']) && in_array($icon_position, ['right', 'bottom'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['conditions'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($filter_config['programs']['enabled'] && !empty($filter_options['programs'])): ?>
                        <div class="amfm-filter-group-buttons">
                            <span class="amfm-filter-group-title">
                                <?php if ($show_icons && !empty($filter_icons['programs']['value'])): ?>
                                    <?php \Elementor\Icons_Manager::render_icon($filter_icons['programs'], ['aria-hidden' => 'true']); ?>
                                <?php endif; ?>
                                <?php echo esc_html($filter_config['programs']['label'] ?? __('Programs:', 'amfm-maps')); ?>
                            </span>
                            <?php foreach ($filter_options['programs'] as $program): ?>
                                <button class="<?php echo esc_attr($button_class_string); ?>" data-filter-type="programs" data-filter-value="<?php echo esc_attr($program); ?>">
                                    <?php if ($show_icons && !empty($filter_icons['programs']['value']) && in_array($icon_position, ['left', 'top'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['programs'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                    <?php echo esc_html($program); ?>
                                    <?php if ($show_icons && !empty($filter_icons['programs']['value']) && in_array($icon_position, ['right', 'bottom'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['programs'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($filter_config['accommodations']['enabled'] && !empty($filter_options['accommodations'])): ?>
                        <div class="amfm-filter-group-buttons">
                            <span class="amfm-filter-group-title">
                                <?php if ($show_icons && !empty($filter_icons['accommodations']['value'])): ?>
                                    <?php \Elementor\Icons_Manager::render_icon($filter_icons['accommodations'], ['aria-hidden' => 'true']); ?>
                                <?php endif; ?>
                                <?php echo esc_html($filter_config['accommodations']['label'] ?? __('Accommodations:', 'amfm-maps')); ?>
                            </span>
                            <?php foreach ($filter_options['accommodations'] as $accommodation): ?>
                                <button class="<?php echo esc_attr($button_class_string); ?>" data-filter-type="accommodations" data-filter-value="<?php echo esc_attr($accommodation); ?>">
                                    <?php if ($show_icons && !empty($filter_icons['accommodations']['value']) && in_array($icon_position, ['left', 'top'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['accommodations'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                    <?php echo esc_html($accommodation); ?>
                                    <?php if ($show_icons && !empty($filter_icons['accommodations']['value']) && in_array($icon_position, ['right', 'bottom'])): ?>
                                        <?php \Elementor\Icons_Manager::render_icon($filter_icons['accommodations'], ['aria-hidden' => 'true']); ?>
                                    <?php endif; ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>

        <style>
            /* Icon positioning styles */
            .amfm-filter-button {
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                border: 1px solid #ddd;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                outline: none;
                background-color: #fff;
                color: #333;
                border-radius: 4px;
                font-family: inherit;
                font-weight: 500;
                line-height: 1;
            }

            .amfm-filter-button:hover {
                background-color: #f5f5f5;
                border-color: #999;
            }

            .amfm-filter-button.active {
                background-color: #007cba;
                color: #fff;
                border-color: #007cba;
            }

            .amfm-filter-button.icon-top,
            .amfm-filter-button.icon-bottom {
                flex-direction: column;
            }

            .amfm-filter-button.icon-right {
                flex-direction: row-reverse;
            }

            .amfm-filter-button.icon-left {
                flex-direction: row;
            }

            /* Button size presets */
            .amfm-filter-button.size-small {
                font-size: 12px;
                padding: 6px 12px;
                min-height: 30px;
            }

            .amfm-filter-button.size-medium {
                font-size: 14px;
                padding: 8px 16px;
                min-height: 36px;
            }

            .amfm-filter-button.size-large {
                font-size: 16px;
                padding: 12px 24px;
                min-height: 48px;
            }

            .amfm-filter-buttons-wrapper {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .amfm-filter-group-buttons {
                margin-bottom: 16px;
            }

            .amfm-filter-group-title {
                display: flex;
                align-items: center;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .amfm-filter-group-title i,
            .amfm-filter-group-title svg {
                margin-right: 6px;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .amfm-filter-buttons-wrapper {
                    flex-direction: column;
                }

                .amfm-filter-button {
                    width: 100%;
                    justify-content: flex-start;
                }

                .amfm-filter-button.icon-right {
                    justify-content: space-between;
                }
            }
        </style>

        <script>
            jQuery(document).ready(function($) {
                // Initialize filter widget
                function initializeFilter() {
                    if (typeof amfmMapFilter !== 'undefined') {
                        console.log('Initializing AMFM Filter...');
                        amfmMapFilter.init({
                            unique_id: "<?php echo esc_js($unique_id); ?>",
                            target_map_id: "<?php echo esc_js($target_map_id); ?>",
                            json_data: <?php echo json_encode($json_data); ?>
                        });
                    } else {
                        console.log('Waiting for amfmMapFilter...');
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
        // Get filter configuration from admin settings
        $filter_config = \Amfm_Maps_Admin::get_filter_config();

        $options = [
            'location' => [],
            'gender' => [],
            'conditions' => [],
            'programs' => [],
            'accommodations' => []
        ];

        if (empty($json_data)) {
            return $options;
        }

        foreach ($json_data as $location) {
            // Extract locations (only if enabled) - look for State field or Location-related fields
            if (!empty($filter_config['location']['enabled'])) {
                $state_value = null;

                // First try the exact field name
                if (!empty($location['State'])) {
                    $state_value = $location['State'];
                } else {
                    // Look for fields that might contain location info
                    foreach ($location as $key => $value) {
                        if (!empty($value) && (
                            stripos($key, 'state') !== false ||
                            stripos($key, 'location') !== false ||
                            stripos($key, 'address') !== false ||
                            stripos($key, 'city') !== false
                        )) {
                            $state_value = $value;
                            break;
                        }
                    }
                }

                if (!empty($state_value)) {
                    $state_name = $this->get_full_state_name($state_value);
                    if (!in_array($state_name, $options['location'])) {
                        $options['location'][] = $state_name;
                    }
                }
            }

            // Extract genders (only if enabled) - look for Gender field or Gender-related fields
            if (!empty($filter_config['gender']['enabled'])) {
                $gender_value = null;

                // First try the exact field name
                if (!empty($location['Details: Gender'])) {
                    $gender_value = $location['Details: Gender'];
                } else {
                    // Look for fields that might contain gender info
                    foreach ($location as $key => $value) {
                        if (!empty($value) && stripos($key, 'gender') !== false) {
                            $gender_value = $value;
                            break;
                        }
                    }
                }

                if (!empty($gender_value)) {
                    if (!in_array($gender_value, $options['gender'])) {
                        $options['gender'][] = $gender_value;
                    }
                }
            }


            // Extract conditions (only if enabled)
            if (!empty($filter_config['conditions']['enabled'])) {
                foreach ($location as $key => $value) {
                    if (strpos($key, 'Conditions: ') === 0 && $value == 1) {
                        $condition = str_replace('Conditions: ', '', $key);
                        if (!in_array($condition, $options['conditions'])) {
                            $options['conditions'][] = $condition;
                        }
                    }
                }
            }

            // Extract programs (only if enabled)
            if (!empty($filter_config['programs']['enabled'])) {
                foreach ($location as $key => $value) {
                    if (strpos($key, 'Programs: ') === 0 && $value == 1) {
                        $program = str_replace('Programs: ', '', $key);
                        if (!in_array($program, $options['programs'])) {
                            $options['programs'][] = $program;
                        }
                    }
                }
            }

            // Extract accommodations (only if enabled)
            if (!empty($filter_config['accommodations']['enabled'])) {
                foreach ($location as $key => $value) {
                    if (strpos($key, 'Accommodations: ') === 0 && $value == 1) {
                        $accommodation = str_replace('Accommodations: ', '', $key);
                        if (!in_array($accommodation, $options['accommodations'])) {
                            $options['accommodations'][] = $accommodation;
                        }
                    }
                }
            }
        }

        foreach ($options as $key => $items) {
            if (!empty($filter_config[$key]['enabled'])) {
                // Apply sorting
                if ($filter_config[$key]['sort_order'] === 'desc') {
                    rsort($options[$key]);
                } else {
                    sort($options[$key]);
                }

                // Apply limits
                $limit = intval($filter_config[$key]['limit']);
                if ($limit > 0) {
                    $options[$key] = array_slice($options[$key], 0, $limit);
                }
            } else {
                // Clear disabled filter types
                $options[$key] = [];
            }
        }

        return $options;
    }

    private function get_full_state_name($abbreviation)
    {
        $states = [
            'AL' => 'Alabama',
            'AK' => 'Alaska',
            'AZ' => 'Arizona',
            'AR' => 'Arkansas',
            'CA' => 'California',
            'CO' => 'Colorado',
            'CT' => 'Connecticut',
            'DE' => 'Delaware',
            'FL' => 'Florida',
            'GA' => 'Georgia',
            'HI' => 'Hawaii',
            'ID' => 'Idaho',
            'IL' => 'Illinois',
            'IN' => 'Indiana',
            'IA' => 'Iowa',
            'KS' => 'Kansas',
            'KY' => 'Kentucky',
            'LA' => 'Louisiana',
            'ME' => 'Maine',
            'MD' => 'Maryland',
            'MA' => 'Massachusetts',
            'MI' => 'Michigan',
            'MN' => 'Minnesota',
            'MS' => 'Mississippi',
            'MO' => 'Missouri',
            'MT' => 'Montana',
            'NE' => 'Nebraska',
            'NV' => 'Nevada',
            'NH' => 'New Hampshire',
            'NJ' => 'New Jersey',
            'NM' => 'New Mexico',
            'NY' => 'New York',
            'NC' => 'North Carolina',
            'ND' => 'North Dakota',
            'OH' => 'Ohio',
            'OK' => 'Oklahoma',
            'OR' => 'Oregon',
            'PA' => 'Pennsylvania',
            'RI' => 'Rhode Island',
            'SC' => 'South Carolina',
            'SD' => 'South Dakota',
            'TN' => 'Tennessee',
            'TX' => 'Texas',
            'UT' => 'Utah',
            'VT' => 'Vermont',
            'VA' => 'Virginia',
            'WA' => 'Washington',
            'WV' => 'West Virginia',
            'WI' => 'Wisconsin',
            'WY' => 'Wyoming'
        ];
        return $states[strtoupper($abbreviation)] ?? $abbreviation;
    }
}
