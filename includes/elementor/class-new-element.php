<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class NewElement extends Widget_Base {

    public function get_name() {
        return 'new_element';
    }

    public function get_title() {
        return __( 'New Element', 'amfm-maps' );
    }

    public function get_icon() {
        return 'eicon-code';
    }

    public function get_categories() {
        return [ 'basic' ];
    }

    protected function _register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __( 'Content', 'amfm-maps' ),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'text',
            [
                'label' => __( 'Text', 'amfm-maps' ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __( 'Default Text', 'amfm-maps' ),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo '<div class="new-element">' . esc_html( $settings['text'] ) . '</div>';
    }

    protected function _content_template() {
        ?>
        <div class="new-element">{{{ settings.text }}}</div>
        <?php
    }
}
?>