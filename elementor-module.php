<?php
/**
 * Plugin Name: AMFM Maps
 * Description: A custom Elementor module to display various maps and elements.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: Your Website
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Include the necessary files
require_once __DIR__ . '/includes/elementor/class-map-widget.php';
require_once __DIR__ . '/includes/elementor/class-new-element.php';

// Function to register the widgets
function register_amfm_maps_widgets( $widgets_manager ) {
    $widgets_manager->register( new \MapWidget() );
    $widgets_manager->register( new \NewElement() );
}

// Hook to register the widgets
add_action( 'elementor/widgets/register', 'register_amfm_maps_widgets' );

// Enqueue scripts and styles
function enqueue_amfm_maps_assets() {
    wp_enqueue_style( 'amfm-maps-style', plugins_url( 'assets/css/style.css', __FILE__ ) );
    wp_enqueue_script( 'amfm-maps-script', plugins_url( 'assets/js/script.js', __FILE__ ), array( 'jquery' ), null, true );
}

// Hook to enqueue assets
add_action( 'wp_enqueue_scripts', 'enqueue_amfm_maps_assets' );
?>