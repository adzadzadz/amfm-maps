<?php
/**
 * Plugin Name: AMFM Maps
 * Description: A custom Elementor module to display various maps and elements.
 * Version: 1.7.0
 * Author:            Adrian T. Saycon
 * Author URI:        https://adzjo.online/adz/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       amfm-maps
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Define version
define( 'AMFM_MAPS_VERSION', '1.7.0' );
define( 'AMFM_MAPS_API_KEY', 'AIzaSyAZLD2M_Rnz6p6d-d57bNOWggRUEC3ZmNc' );

// Check if Elementor is installed and active
function amfm_maps_check_elementor() {
    if ( ! did_action( 'elementor/loaded' ) ) {
        add_action( 'admin_notices', 'amfm_maps_admin_notice_missing_elementor' );
        deactivate_plugins( plugin_basename( __FILE__ ) );
        return false;
    }
    return true;
}

// Admin notice for missing Elementor
function amfm_maps_admin_notice_missing_elementor() {
    ?>
    <div class="notice notice-error is-dismissible">
        <p><?php esc_html_e( 'AMFM Maps requires Elementor to be installed and activated.', 'amfm-maps' ); ?></p>
    </div>
    <?php
}

// Initialize the plugin
function amfm_maps_init() {
    if ( ! amfm_maps_check_elementor() ) {
        return;
    }

    // Include the necessary files
    require_once __DIR__ . '/includes/elementor/class-map-widget.php';

    // Register the widget
    function register_amfm_map_widget() {
        \Elementor\Plugin::instance()->widgets_manager->register( new \AMFM_Maps\Elementor\MapWidget() );
    }

    // Hook to register the widgets
    add_action( 'elementor/widgets/widgets_registered', 'register_amfm_map_widget' );

    // Enqueue scripts and styles
    function enqueue_amfm_maps_assets() {
        // Enqueue imagesLoaded library
        wp_enqueue_script('imagesloaded', 'https://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/4.1.4/imagesloaded.pkgd.min.js', ['jquery'], '4.1.4', true);

        // Enqueue Owl Carousel CSS and JS
        wp_enqueue_style('owl-carousel-css', 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css', [], '2.3.4');
        wp_enqueue_style('owl-carousel-theme-css', 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css', [], '2.3.4');
        wp_enqueue_script('owl-carousel-js', 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js', ['jquery'], '2.3.4', true);

        // Enqueue Google Maps API
        wp_enqueue_script( 'amfm-google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . AMFM_MAPS_API_KEY . '&loading=async&libraries=places', array(), null, false );

        // Enqueue plugin-specific styles and scripts
        wp_enqueue_style( 'amfm-maps-style', plugins_url( 'assets/css/style.css', __FILE__ ), array(), AMFM_MAPS_VERSION );
        wp_enqueue_script( 'amfm-maps-script', plugins_url( 'assets/js/script.js', __FILE__ ), array( 'jquery', 'owl-carousel-js', 'imagesloaded', 'amfm-google-maps' ), AMFM_MAPS_VERSION, true );
    }

    // Hook to enqueue assets
    add_action( 'wp_enqueue_scripts', 'enqueue_amfm_maps_assets' );
}

// Hook to initialize the plugin
add_action( 'elementor/init', 'amfm_maps_init' );
