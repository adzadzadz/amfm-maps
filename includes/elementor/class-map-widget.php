<?php
namespace AMFM_Maps\Elementor;

use Elementor\Widget_Base;

class MapWidget extends Widget_Base {

    public function get_name() {
        return 'map_widget';
    }

    public function get_title() {
        return __( 'Map Widget', 'amfm-maps' );
    }

    public function get_icon() {
        return 'eicon-map';
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
            'map_location',
            [
                'label' => __( 'Map Location', 'amfm-maps' ),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => __( 'New York, USA', 'amfm-maps' ),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo '<div class="map-widget">';
        echo '<h2>' . esc_html( $settings['map_location'] ) . '</h2>';
        // Here you would integrate the map rendering logic
        echo '</div>';
    }

    protected function _content_template() {
        ?>
        <div class="map-widget">
            <h2>{{ settings.map_location }}</h2>
            <!-- Map rendering logic would go here -->
        </div>
        <?php
    }
}
?>