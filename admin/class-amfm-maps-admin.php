<?php

/**
 * The admin-specific functionality of the AMFM Maps plugin.
 *
 * @link       https://adzbyte.com/
 * @since      1.0.0
 *
 * @package    Amfm_Maps
 * @subpackage Amfm_Maps/admin
 */

/**
 * The admin-specific functionality of the AMFM Maps plugin.
 *
 * Defines the plugin name, version, and admin page functionality.
 *
 * @package    Amfm_Maps
 * @subpackage Amfm_Maps/admin
 * @author     Adrian T. Saycon <adzbite@gmail.com>
 */
class Amfm_Maps_Admin
{

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct($plugin_name, $version)
	{
		$this->plugin_name = $plugin_name;
		$this->version = $version;
		
		// Initialize cron functionality
		add_action('init', array($this, 'init_cron_hooks'));
		add_action('amfm_maps_sync_cron', array($this, 'cron_sync_data'));
		
		// Add AJAX handlers
		add_action('wp_ajax_amfm_maps_get_sync_status', array($this, 'ajax_get_sync_status'));
		add_action('wp_ajax_amfm_maps_manual_sync', array($this, 'ajax_manual_sync'));
		add_action('wp_ajax_amfm_maps_manual_sync', array($this, 'ajax_manual_sync'));
	}

	/**
	 * Initialize cron hooks and schedules
	 */
	public function init_cron_hooks()
	{
		// Schedule cron job based on sync interval setting
		$sync_interval = get_option('amfm_maps_sync_interval', 'none');
		
		// Clear existing cron job
		wp_clear_scheduled_hook('amfm_maps_sync_cron');
		
		// Schedule new cron job if needed
		if ($sync_interval !== 'none') {
			if (!wp_next_scheduled('amfm_maps_sync_cron')) {
				wp_schedule_event(time(), $sync_interval, 'amfm_maps_sync_cron');
			}
		}
	}

	/**
	 * Cron job to sync data
	 */
	public function cron_sync_data()
	{
		$this->sync_json_data();
	}

	/**
	 * AJAX handler to get sync status
	 */
	public function ajax_get_sync_status()
	{
		$last_sync = get_option('amfm_maps_last_sync', '');
		$sync_status = get_option('amfm_maps_sync_status', '');
		
		$status_class = 'muted';
		$status_text = __('Not synced', 'amfm-maps');
		
		switch ($sync_status) {
			case 'success':
				$status_class = 'success';
				$status_text = __('Success', 'amfm-maps');
				break;
			case 'error':
				$status_class = 'error';
				$status_text = __('Error', 'amfm-maps');
				break;
		}
		
		wp_send_json_success(array(
			'last_sync' => $last_sync ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($last_sync)) : '',
			'status' => array(
				'class' => $status_class,
				'text' => $status_text
			)
		));
	}

	/**
	 * AJAX handler for manual sync
	 */
	public function ajax_manual_sync()
	{
		// Verify nonce
		if (!wp_verify_nonce($_POST['nonce'], 'amfm_maps_ajax_nonce')) {
			wp_send_json_error(array('message' => __('Security check failed', 'amfm-maps')));
			return;
		}
		
		// Check user capabilities
		if (!current_user_can('manage_options')) {
			wp_send_json_error(array('message' => __('Insufficient permissions', 'amfm-maps')));
			return;
		}
		
		$result = $this->manual_sync_data();
		
		if ($result['success']) {
			wp_send_json_success($result);
		} else {
			wp_send_json_error($result);
		}
	}

	/**
	 * Sync data from JSON URL
	 */
	private function sync_json_data()
	{
		$json_url = get_option('amfm_maps_json_url', '');
		
		if (empty($json_url)) {
			update_option('amfm_maps_sync_status', 'error');
			return false;
		}
		
		$response = wp_remote_get($json_url, array(
			'timeout' => 30,
			'headers' => array(
				'Accept' => 'application/json',
				'User-Agent' => 'AMFM Maps WordPress Plugin'
			)
		));
		
		if (is_wp_error($response)) {
			update_option('amfm_maps_sync_status', 'error');
			error_log('AMFM Maps sync error: ' . $response->get_error_message());
			return false;
		}
		
		$response_code = wp_remote_retrieve_response_code($response);
		if ($response_code !== 200) {
			update_option('amfm_maps_sync_status', 'error');
			error_log('AMFM Maps sync error: HTTP ' . $response_code);
			return false;
		}
		
		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body, true);
		
		if (json_last_error() !== JSON_ERROR_NONE) {
			update_option('amfm_maps_sync_status', 'error');
			error_log('AMFM Maps sync error: Invalid JSON - ' . json_last_error_msg());
			return false;
		}
		
		// Save the data
		update_option('amfm_maps_json_data', $data);
		update_option('amfm_maps_last_sync', current_time('mysql'));
		update_option('amfm_maps_sync_status', 'success');
		
		return true;
	}

	/**
	 * Register the Maps admin menu under the AMFM menu.
	 *
	 * @since    1.0.0
	 */
	public function add_admin_menu()
	{
		// Add Maps submenu under the existing AMFM menu
		add_submenu_page(
			'amfm', // Parent menu slug (from amfm-bylines plugin)
			__('Maps', 'amfm-maps'), // Page title
			__('Maps', 'amfm-maps'), // Menu title
			'manage_options', // Capability
			'amfm-maps', // Menu slug
			array($this, 'display_admin_page') // Callback function
		);
	}

	/**
	 * Display the Maps admin page.
	 *
	 * @since    1.0.0
	 */
	public function display_admin_page()
	{
		include plugin_dir_path(__FILE__) . 'partials/amfm-maps-admin-display.php';
	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles()
	{
		wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'css/amfm-maps-admin.css', array(), $this->version, 'all');
	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts()
	{
		wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/amfm-maps-admin.js', array('jquery'), $this->version, false);
		
		// Localize script for AJAX
		wp_localize_script($this->plugin_name, 'amfmMapsAdmin', array(
			'ajax_url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('amfm_maps_ajax_nonce')
		));
	}

	/**
	 * Get stored JSON data
	 *
	 * @return array|null The stored JSON data or null if not available
	 */
	public static function get_json_data()
	{
		$data = get_option('amfm_maps_json_data', null);
		return is_array($data) ? $data : null;
	}

	/**
	 * Check if JSON data is available and recent
	 *
	 * @param int $max_age_hours Maximum age in hours (default 24)
	 * @return boolean
	 */
	public static function is_data_fresh($max_age_hours = 24)
	{
		$last_sync = get_option('amfm_maps_last_sync', '');
		$sync_status = get_option('amfm_maps_sync_status', '');
		
		if (empty($last_sync) || $sync_status !== 'success') {
			return false;
		}
		
		$last_sync_time = strtotime($last_sync);
		$max_age_seconds = $max_age_hours * 3600;
		
		return (time() - $last_sync_time) <= $max_age_seconds;
	}

	/**
	 * Get sync status information
	 *
	 * @return array
	 */
	public static function get_sync_info()
	{
		return array(
			'last_sync' => get_option('amfm_maps_last_sync', ''),
			'status' => get_option('amfm_maps_sync_status', ''),
			'url' => get_option('amfm_maps_json_url', ''),
			'interval' => get_option('amfm_maps_sync_interval', 'none'),
			'has_data' => !empty(get_option('amfm_maps_json_data', null))
		);
	}

	/**
	 * Handle manual sync request
	 *
	 * @return array Result of sync operation
	 */
	public function handle_manual_sync()
	{
		return $this->sync_json_data();
	}

	/**
	 * Public method to sync data (for manual sync)
	 *
	 * @return array
	 */
	public function manual_sync_data()
	{
		$json_url = get_option('amfm_maps_json_url', '');
		
		if (empty($json_url)) {
			return array('success' => false, 'message' => __('No URL configured', 'amfm-maps'));
		}
		
		// Validate URL format
		if (!filter_var($json_url, FILTER_VALIDATE_URL)) {
			return array('success' => false, 'message' => __('Invalid URL format', 'amfm-maps'));
		}
		
		try {
			$response = wp_remote_get($json_url, array(
				'timeout' => 30,
				'headers' => array(
					'Accept' => 'application/json',
					'User-Agent' => 'AMFM Maps WordPress Plugin'
				)
			));
			
			if (is_wp_error($response)) {
				update_option('amfm_maps_sync_status', 'error');
				return array('success' => false, 'message' => $response->get_error_message());
			}
			
			$response_code = wp_remote_retrieve_response_code($response);
			if ($response_code !== 200) {
				update_option('amfm_maps_sync_status', 'error');
				return array('success' => false, 'message' => sprintf(__('HTTP Error: %d', 'amfm-maps'), $response_code));
			}
			
			$body = wp_remote_retrieve_body($response);
			
			if (empty($body)) {
				update_option('amfm_maps_sync_status', 'error');
				return array('success' => false, 'message' => __('Empty response from server', 'amfm-maps'));
			}
			
			$data = json_decode($body, true);
			
			if (json_last_error() !== JSON_ERROR_NONE) {
				update_option('amfm_maps_sync_status', 'error');
				return array('success' => false, 'message' => __('Invalid JSON response: ', 'amfm-maps') . json_last_error_msg());
			}
			
			// Save the data
			update_option('amfm_maps_json_data', $data);
			update_option('amfm_maps_last_sync', current_time('mysql'));
			update_option('amfm_maps_sync_status', 'success');
			
			return array('success' => true, 'message' => __('Data synced successfully', 'amfm-maps'));
			
		} catch (Exception $e) {
			update_option('amfm_maps_sync_status', 'error');
			return array('success' => false, 'message' => __('Sync error: ', 'amfm-maps') . $e->getMessage());
		}
	}
}
