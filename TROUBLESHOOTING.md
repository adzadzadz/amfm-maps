# AMFM Map V2 Widget - Troubleshooting Guide

## Map Not Displaying Issues

If the map is not displaying properly, follow these troubleshooting steps:

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for error messages. Look for:
- Google Maps API loading errors
- JavaScript errors related to `amfmMapV2`
- Network errors when loading scripts

### 2. Verify Google Maps API Key
Ensure the API key is valid and has the following APIs enabled:
- Maps JavaScript API
- Places API
- Geocoding API (if used)

Current API key in use: `AIzaSyAZLD2M_Rnz6p6d-d57bNOWggRUEC3ZmNc`

### 3. Check Script Loading
The widget depends on these scripts loading in order:
1. jQuery (WordPress core)
2. Google Maps JavaScript API
3. AMFM Maps script (`script.js`)

### 4. Elementor Preview vs Live Page
- In Elementor editor: Scripts may load differently
- In preview mode: Should work normally
- On live page: Should work normally

### 5. Clear Caches
If using caching plugins, clear:
- Page cache
- Object cache
- CDN cache
- Browser cache

### 6. Check Page Restrictions
The plugin originally only loaded scripts on specific pages. This has been updated to load on any page with the widget, but check if there are additional restrictions.

### 7. Debug Data Source
The widget shows a debug message if no JSON data is available:
- Check if `amfm_maps_json_data` option exists in WordPress
- Verify the JSON data structure is correct
- Use the admin panel to sync data if needed

### 8. Test with Demo Data
You can test the widget with custom JSON data by:
1. Setting "Use Stored JSON Data" to "No"
2. Adding sample JSON in the "Custom JSON Data" field

### 9. Console Debug Information
The widget outputs debug information to the console:
```javascript
AMFM Map V2 Widget initializing for: [unique_id]
JSON Data count: [number]
Waiting for dependencies... [status object]
Google Maps API loaded, initializing map...
Map initialized for: [unique_id]
Map idle event fired, loading locations...
```

### 10. Common Fixes

#### Fix 1: Force Script Loading
Add this to your theme's `functions.php`:
```php
add_action('wp_enqueue_scripts', function() {
    if (has_shortcode(get_post()->post_content, 'elementor-template')) {
        wp_enqueue_script('amfm-google-maps', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAZLD2M_Rnz6p6d-d57bNOWggRUEC3ZmNc&loading=async&libraries=places', [], null, false);
    }
}, 5);
```

#### Fix 2: Manual Initialization
If automatic initialization fails, you can manually trigger it:
```javascript
// In browser console
if (typeof amfmMapV2 !== 'undefined') {
    amfmMapV2.init({
        unique_id: 'your_widget_id',
        json_data: [], // your data
        api_key: 'your_api_key'
    });
}
```

#### Fix 3: Check Container Dimensions
Ensure the map container has proper dimensions:
```css
.amfm-map-wrapper {
    width: 100% !important;
    height: 400px !important;
    min-height: 400px !important;
}
```

### 11. Known Issues

1. **Elementor Editor**: Map may not load in the editor preview - this is normal
2. **Mobile Safari**: May require user interaction to initialize maps
3. **Ad Blockers**: Some ad blockers may interfere with Google Maps API

### 12. Support Information

When reporting issues, please provide:
- WordPress version
- Elementor version
- Browser and version
- Console error messages
- Whether the issue occurs in editor, preview, or live page
- Any custom code or conflicting plugins

---

## Files Modified for Map V2 Widget

1. **Main Plugin File**: `/amfm-maps.php`
   - Updated script enqueuing logic
   - Added Elementor script registration
   - Registered new widget

2. **Widget Class**: `/includes/elementor/class-map-v2-widget.php`
   - Complete new widget implementation
   - Filter generation from JSON data
   - Script dependencies

3. **Styles**: `/assets/css/style.css`
   - New widget styling
   - Responsive layout
   - Filter interface

4. **JavaScript**: `/assets/js/script.js`
   - New `amfmMapV2` namespace
   - Map initialization logic
   - Filter functionality

5. **Demo**: `/demo-widget-layout.html`
   - Visual demonstration
   - Working Google Maps integration
