<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://adzbyte.com/
 * @since      1.0.0
 *
 * @package    Amfm_Maps
 * @subpackage Amfm_Maps/admin/partials
 */

// Get current settings
$json_url = get_option('amfm_maps_json_url', '');
$sync_interval = get_option('amfm_maps_sync_interval', 'none');
$last_sync = get_option('amfm_maps_last_sync', '');
$sync_status = get_option('amfm_maps_sync_status', '');

// Handle form submission
if (isset($_POST['submit']) && wp_verify_nonce($_POST['amfm_maps_nonce'], 'amfm_maps_save_settings')) {
    $json_url = sanitize_url($_POST['json_url']);
    $sync_interval = sanitize_text_field($_POST['sync_interval']);
    
    update_option('amfm_maps_json_url', $json_url);
    update_option('amfm_maps_sync_interval', $sync_interval);
    
    echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'amfm-maps') . '</p></div>';
}

// Handle manual sync
if (isset($_POST['manual_sync']) && wp_verify_nonce($_POST['amfm_maps_sync_nonce'], 'amfm_maps_manual_sync')) {
    // Create an instance of the admin class to call the sync method
    $version = defined('AMFM_MAPS_VERSION') ? AMFM_MAPS_VERSION : '1.0.0';
    $admin_instance = new Amfm_Maps_Admin('amfm-maps', $version);
    $result = $admin_instance->manual_sync_data();
    
    if ($result['success']) {
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Data synced successfully!', 'amfm-maps') . '</p></div>';
    } else {
        echo '<div class="notice notice-error is-dismissible"><p>' . sprintf(__('Sync failed: %s', 'amfm-maps'), $result['message']) . '</p></div>';
    }
}

?>

<div class="wrap amfm-maps-wrap">
    <div class="amfm-maps-header">
        <h1 class="amfm-maps-title">
            <i class="dashicons dashicons-location-alt"></i>
            <?php echo esc_html(get_admin_page_title()); ?>
        </h1>
        <p class="amfm-maps-subtitle"><?php _e('Configure your Maps data source and synchronization settings', 'amfm-maps'); ?></p>
    </div>
    
    <!-- Tab Navigation -->
    <div class="amfm-maps-tabs">
        <div class="amfm-maps-tab-nav">
            <button class="amfm-maps-tab-button active" data-tab="configuration">
                <i class="dashicons dashicons-admin-settings"></i>
                <?php _e('Configuration', 'amfm-maps'); ?>
            </button>
            <button class="amfm-maps-tab-button" data-tab="data-view">
                <i class="dashicons dashicons-database"></i>
                <?php _e('Data View', 'amfm-maps'); ?>
            </button>
        </div>
    </div>
    
    <!-- Tab Content -->
    <div class="amfm-maps-tab-content">
        <!-- Configuration Tab -->
        <div id="tab-configuration" class="amfm-maps-tab-pane active">
            <div class="amfm-maps-container">
        <div class="amfm-maps-main">
            <!-- Data Source Configuration -->
            <div class="amfm-maps-panel">
                <div class="amfm-maps-panel-header">
                    <h2 class="amfm-maps-panel-title">
                        <i class="dashicons dashicons-admin-links"></i>
                        <?php _e('Data Source', 'amfm-maps'); ?>
                    </h2>
                    <p class="amfm-maps-panel-description"><?php _e('Configure the JSON data source for your maps', 'amfm-maps'); ?></p>
                </div>
                
                <div class="amfm-maps-panel-body">
                    <form method="post" action="">
                        <?php wp_nonce_field('amfm_maps_save_settings', 'amfm_maps_nonce'); ?>
                        
                        <div class="amfm-maps-form-group">
                            <label for="json_url" class="amfm-maps-label">
                                <?php _e('JSON Data URL', 'amfm-maps'); ?>
                                <span class="required">*</span>
                            </label>
                            <input 
                                type="url" 
                                id="json_url" 
                                name="json_url" 
                                value="<?php echo esc_url($json_url); ?>" 
                                class="amfm-maps-input amfm-maps-input-large"
                                placeholder="https://example.com/api/maps-data.json"
                                required
                            />
                            <p class="amfm-maps-help-text">
                                <?php _e('Enter the URL that returns JSON data for your maps. This data will be fetched and cached locally.', 'amfm-maps'); ?>
                            </p>
                        </div>
                        
                        <div class="amfm-maps-form-group">
                            <label for="sync_interval" class="amfm-maps-label">
                                <?php _e('Sync Interval', 'amfm-maps'); ?>
                            </label>
                            <select id="sync_interval" name="sync_interval" class="amfm-maps-select">
                                <option value="none" <?php selected($sync_interval, 'none'); ?>><?php _e('None (Manual only)', 'amfm-maps'); ?></option>
                                <option value="daily" <?php selected($sync_interval, 'daily'); ?>><?php _e('Daily', 'amfm-maps'); ?></option>
                                <option value="weekly" <?php selected($sync_interval, 'weekly'); ?>><?php _e('Weekly', 'amfm-maps'); ?></option>
                                <option value="monthly" <?php selected($sync_interval, 'monthly'); ?>><?php _e('Monthly', 'amfm-maps'); ?></option>
                            </select>
                            <p class="amfm-maps-help-text">
                                <?php _e('Choose how often the data should be automatically synchronized from the source URL.', 'amfm-maps'); ?>
                            </p>
                        </div>
                        
                        <div class="amfm-maps-form-actions">
                            <button type="submit" name="submit" class="amfm-maps-button amfm-maps-button-primary">
                                <i class="dashicons dashicons-yes"></i>
                                <?php _e('Save Settings', 'amfm-maps'); ?>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Sync Status & Manual Sync -->
            <div class="amfm-maps-panel">
                <div class="amfm-maps-panel-header">
                    <h2 class="amfm-maps-panel-title">
                        <i class="dashicons dashicons-update"></i>
                        <?php _e('Data Synchronization', 'amfm-maps'); ?>
                    </h2>
                    <p class="amfm-maps-panel-description"><?php _e('Monitor and control data synchronization', 'amfm-maps'); ?></p>
                </div>
                
                <div class="amfm-maps-panel-body">
                    <div class="amfm-maps-sync-info">
                        <div class="amfm-maps-sync-stat">
                            <div class="amfm-maps-sync-stat-label"><?php _e('Last Sync', 'amfm-maps'); ?></div>
                            <div class="amfm-maps-sync-stat-value">
                                <?php 
                                if (!empty($last_sync)) {
                                    echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($last_sync)));
                                } else {
                                    echo '<span class="amfm-maps-muted">' . __('Never', 'amfm-maps') . '</span>';
                                }
                                ?>
                            </div>
                        </div>
                        
                        <div class="amfm-maps-sync-stat">
                            <div class="amfm-maps-sync-stat-label"><?php _e('Status', 'amfm-maps'); ?></div>
                            <div class="amfm-maps-sync-stat-value">
                                <?php
                                $status_class = '';
                                $status_text = __('Unknown', 'amfm-maps');
                                
                                switch ($sync_status) {
                                    case 'success':
                                        $status_class = 'success';
                                        $status_text = __('Success', 'amfm-maps');
                                        break;
                                    case 'error':
                                        $status_class = 'error';
                                        $status_text = __('Error', 'amfm-maps');
                                        break;
                                    default:
                                        $status_class = 'muted';
                                        $status_text = __('Not synced', 'amfm-maps');
                                        break;
                                }
                                ?>
                                <span class="amfm-maps-status amfm-maps-status-<?php echo esc_attr($status_class); ?>">
                                    <?php echo esc_html($status_text); ?>
                                </span>
                            </div>
                        </div>
                        
                        <div class="amfm-maps-sync-stat">
                            <div class="amfm-maps-sync-stat-label"><?php _e('Next Sync', 'amfm-maps'); ?></div>
                            <div class="amfm-maps-sync-stat-value">
                                <?php
                                if ($sync_interval === 'none') {
                                    echo '<span class="amfm-maps-muted">' . __('Manual only', 'amfm-maps') . '</span>';
                                } else {
                                    echo '<span class="amfm-maps-muted">' . sprintf(__('Based on %s schedule', 'amfm-maps'), $sync_interval) . '</span>';
                                }
                                ?>
                            </div>
                        </div>
                    </div>
                    
                    <form method="post" action="" class="amfm-maps-sync-form">
                        <?php wp_nonce_field('amfm_maps_manual_sync', 'amfm_maps_sync_nonce'); ?>
                        <button type="submit" name="manual_sync" class="amfm-maps-button amfm-maps-button-secondary" <?php echo empty($json_url) ? 'disabled' : ''; ?>>
                            <i class="dashicons dashicons-update"></i>
                            <?php _e('Sync Now', 'amfm-maps'); ?>
                        </button>
                        <?php if (empty($json_url)): ?>
                            <p class="amfm-maps-help-text amfm-maps-warning">
                                <?php _e('Please configure a JSON URL first before syncing.', 'amfm-maps'); ?>
                            </p>
                        <?php endif; ?>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Sidebar with additional info -->
        <div class="amfm-maps-sidebar">
            <div class="amfm-maps-panel">
                <div class="amfm-maps-panel-header">
                    <h3 class="amfm-maps-panel-title">
                        <i class="dashicons dashicons-info"></i>
                        <?php _e('About JSON Data', 'amfm-maps'); ?>
                    </h3>
                </div>
                <div class="amfm-maps-panel-body">
                    <p class="amfm-maps-small-text">
                        <?php _e('The JSON data should contain map locations, markers, or other geographic data that will be used by your maps.', 'amfm-maps'); ?>
                    </p>
                    <p class="amfm-maps-small-text">
                        <?php _e('Automatic synchronization helps keep your maps updated with the latest data from your source.', 'amfm-maps'); ?>
                    </p>
                </div>
            </div>
            
            <div class="amfm-maps-panel">
                <div class="amfm-maps-panel-header">
                    <h3 class="amfm-maps-panel-title">
                        <i class="dashicons dashicons-performance"></i>
                        <?php _e('Performance Tips', 'amfm-maps'); ?>
                    </h3>
                </div>
                <div class="amfm-maps-panel-body">
                    <ul class="amfm-maps-tips-list">
                        <li><?php _e('Use HTTPS URLs for better security', 'amfm-maps'); ?></li>
                        <li><?php _e('Smaller JSON files load faster', 'amfm-maps'); ?></li>
                        <li><?php _e('Daily sync is recommended for frequently updated data', 'amfm-maps'); ?></li>
                        <li><?php _e('Weekly or monthly sync for static data', 'amfm-maps'); ?></li>
                    </ul>
                </div>
                </div>
            </div>
        </div>
        
        <!-- Data View Tab -->
        <div id="tab-data-view" class="amfm-maps-tab-pane">
            <div class="amfm-maps-container">
                <div class="amfm-maps-main amfm-maps-full-width">
                    <?php
                    // Get stored JSON data
                    $json_data = get_option('amfm_maps_json_data', null);
                    $last_sync = get_option('amfm_maps_last_sync', '');
                    $sync_status = get_option('amfm_maps_sync_status', '');
                    ?>
                    
                    <!-- Data Overview Panel -->
                    <div class="amfm-maps-panel">
                        <div class="amfm-maps-panel-header">
                            <h2 class="amfm-maps-panel-title">
                                <i class="dashicons dashicons-database"></i>
                                <?php _e('Stored JSON Data', 'amfm-maps'); ?>
                            </h2>
                            <p class="amfm-maps-panel-description">
                                <?php 
                                if (!empty($json_data)) {
                                    printf(__('Data structure and contents from your JSON source. Last updated: %s', 'amfm-maps'), 
                                           $last_sync ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($last_sync)) : __('Never', 'amfm-maps'));
                                } else {
                                    _e('No data available. Please configure and sync your JSON data source first.', 'amfm-maps');
                                }
                                ?>
                            </p>
                        </div>
                        
                        <div class="amfm-maps-panel-body">
                            <?php if (!empty($json_data) && is_array($json_data)): ?>
                                <!-- Data Statistics -->
                                <div class="amfm-maps-data-stats">
                                    <div class="amfm-maps-stat-item">
                                        <div class="amfm-maps-stat-number"><?php echo count($json_data, COUNT_RECURSIVE); ?></div>
                                        <div class="amfm-maps-stat-label"><?php _e('Total Elements', 'amfm-maps'); ?></div>
                                    </div>
                                    <div class="amfm-maps-stat-item">
                                        <div class="amfm-maps-stat-number"><?php echo count($json_data); ?></div>
                                        <div class="amfm-maps-stat-label"><?php _e('Root Elements', 'amfm-maps'); ?></div>
                                    </div>
                                    <div class="amfm-maps-stat-item">
                                        <div class="amfm-maps-stat-number"><?php echo strlen(json_encode($json_data)); ?></div>
                                        <div class="amfm-maps-stat-label"><?php _e('Data Size (bytes)', 'amfm-maps'); ?></div>
                                    </div>
                                    <div class="amfm-maps-stat-item">
                                        <div class="amfm-maps-stat-number"><?php echo get_json_data_depth($json_data); ?></div>
                                        <div class="amfm-maps-stat-label"><?php _e('Max Depth', 'amfm-maps'); ?></div>
                                    </div>
                                </div>
                                
                                <!-- Data Structure Analysis -->
                                <div class="amfm-maps-data-analysis">
                                    <h3><?php _e('Data Structure', 'amfm-maps'); ?></h3>
                                    <div class="amfm-maps-structure-tree">
                                        <?php echo generate_json_structure_tree($json_data); ?>
                                    </div>
                                </div>
                                
                                <!-- Interactive Data Table -->
                                <div class="amfm-maps-data-table-container">
                                    <div class="amfm-maps-table-controls">
                                        <div class="amfm-maps-search-box">
                                            <input type="text" id="data-search" placeholder="<?php _e('Search data...', 'amfm-maps'); ?>" class="amfm-maps-input">
                                            <i class="dashicons dashicons-search"></i>
                                        </div>
                                        <div class="amfm-maps-table-actions">
                                            <button class="amfm-maps-button amfm-maps-button-secondary" id="expand-all">
                                                <i class="dashicons dashicons-plus-alt"></i>
                                                <?php _e('Expand All', 'amfm-maps'); ?>
                                            </button>
                                            <button class="amfm-maps-button amfm-maps-button-secondary" id="collapse-all">
                                                <i class="dashicons dashicons-minus"></i>
                                                <?php _e('Collapse All', 'amfm-maps'); ?>
                                            </button>
                                            <button class="amfm-maps-button amfm-maps-button-secondary" id="export-json">
                                                <i class="dashicons dashicons-download"></i>
                                                <?php _e('Export JSON', 'amfm-maps'); ?>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="amfm-maps-data-table-wrapper">
                                        <table class="amfm-maps-data-table" id="json-data-table">
                                            <thead>
                                                <tr>
                                                    <th><?php _e('Key/Index', 'amfm-maps'); ?></th>
                                                    <th><?php _e('Type', 'amfm-maps'); ?></th>
                                                    <th><?php _e('Value', 'amfm-maps'); ?></th>
                                                    <th><?php _e('Actions', 'amfm-maps'); ?></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php echo generate_json_table_rows($json_data); ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <!-- Raw JSON View -->
                                <div class="amfm-maps-raw-json">
                                    <h3><?php _e('Raw JSON Data', 'amfm-maps'); ?></h3>
                                    <div class="amfm-maps-json-container">
                                        <button class="amfm-maps-copy-button" onclick="copyToClipboard('json-raw-data')">
                                            <i class="dashicons dashicons-admin-page"></i>
                                            <?php _e('Copy to Clipboard', 'amfm-maps'); ?>
                                        </button>
                                        <pre id="json-raw-data" class="amfm-maps-json-code"><?php echo esc_html(json_encode($json_data, JSON_PRETTY_PRINT)); ?></pre>
                                    </div>
                                </div>
                                
                            <?php else: ?>
                                <!-- No Data State -->
                                <div class="amfm-maps-no-data">
                                    <div class="amfm-maps-no-data-icon">
                                        <i class="dashicons dashicons-database"></i>
                                    </div>
                                    <h3><?php _e('No Data Available', 'amfm-maps'); ?></h3>
                                    <p><?php _e('There is no JSON data to display. Please configure your data source in the Configuration tab and perform a sync.', 'amfm-maps'); ?></p>
                                    <button class="amfm-maps-button amfm-maps-button-primary" onclick="switchTab('configuration')">
                                        <i class="dashicons dashicons-admin-settings"></i>
                                        <?php _e('Go to Configuration', 'amfm-maps'); ?>
                                    </button>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
/**
 * Helper function to calculate JSON data depth
 */
function get_json_data_depth($data, $depth = 0) {
    if (!is_array($data)) {
        return $depth;
    }
    
    $max_depth = $depth;
    foreach ($data as $item) {
        if (is_array($item)) {
            $current_depth = get_json_data_depth($item, $depth + 1);
            $max_depth = max($max_depth, $current_depth);
        }
    }
    return $max_depth;
}

/**
 * Generate structure tree HTML
 */
function generate_json_structure_tree($data, $key = 'root', $level = 0) {
    $indent = str_repeat('  ', $level);
    $html = '';
    
    if (is_array($data)) {
        $type = array_keys($data) === range(0, count($data) - 1) ? 'array' : 'object';
        $count = count($data);
        
        $html .= "<div class='structure-item level-{$level}'>";
        $html .= "<span class='structure-key'>{$key}</span>";
        $html .= "<span class='structure-type type-{$type}'>{$type}</span>";
        $html .= "<span class='structure-count'>({$count} items)</span>";
        
        if ($count <= 10) { // Only show children for smaller objects/arrays
            $html .= "<div class='structure-children'>";
            foreach ($data as $childKey => $childValue) {
                $html .= generate_json_structure_tree($childValue, $childKey, $level + 1);
            }
            $html .= "</div>";
        }
        $html .= "</div>";
    } else {
        $type = gettype($data);
        $html .= "<div class='structure-item level-{$level}'>";
        $html .= "<span class='structure-key'>{$key}</span>";
        $html .= "<span class='structure-type type-{$type}'>{$type}</span>";
        $html .= "</div>";
    }
    
    return $html;
}

/**
 * Generate table rows for JSON data
 */
function generate_json_table_rows($data, $parent_key = '', $level = 0) {
    $html = '';
    
    if (!is_array($data)) {
        return $html;
    }
    
    foreach ($data as $key => $value) {
        $full_key = $parent_key ? $parent_key . '.' . $key : $key;
        $type = gettype($value);
        $display_value = '';
        $has_children = false;
        
        if (is_array($value)) {
            $has_children = true;
            $count = count($value);
            $display_value = $type === 'array' ? "[Array with {$count} items]" : "{Object with {$count} properties}";
        } elseif (is_string($value)) {
            $display_value = strlen($value) > 100 ? substr($value, 0, 100) . '...' : $value;
        } elseif (is_bool($value)) {
            $display_value = $value ? 'true' : 'false';
        } elseif (is_null($value)) {
            $display_value = 'null';
        } else {
            $display_value = $value;
        }
        
        $row_class = $has_children ? 'has-children' : '';
        $row_class .= $level > 0 ? ' child-row level-' . $level : '';
        
        $html .= "<tr class='data-row {$row_class}' data-key='{$full_key}' data-level='{$level}'>";
        $html .= "<td class='key-cell'>";
        $html .= str_repeat('<span class="indent"></span>', $level);
        if ($has_children) {
            $html .= "<span class='toggle-children' data-key='{$full_key}'><i class='dashicons dashicons-arrow-right'></i></span>";
        }
        $html .= "<span class='key-name'>{$key}</span>";
        $html .= "</td>";
        $html .= "<td class='type-cell'><span class='type-badge type-{$type}'>{$type}</span></td>";
        $html .= "<td class='value-cell'><span class='value-content'>" . esc_html($display_value) . "</span></td>";
        $html .= "<td class='actions-cell'>";
        if (!$has_children && is_string($value) && strlen($value) > 100) {
            $html .= "<button class='amfm-maps-button-small' onclick='showFullValue(\"{$full_key}\")'>View Full</button>";
        }
        if ($has_children) {
            $html .= "<button class='amfm-maps-button-small' onclick='exportSubset(\"{$full_key}\")'>Export</button>";
        }
        $html .= "</td>";
        $html .= "</tr>";
        
        // Add children rows (initially hidden)
        if ($has_children) {
            $html .= generate_json_table_rows($value, $full_key, $level + 1);
        }
    }
    
    return $html;
}
?>
