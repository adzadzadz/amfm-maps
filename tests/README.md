# AMFM Maps Plugin - Playwright Testing

This directory contains comprehensive Playwright tests for the AMFM Maps WordPress plugin, specifically designed to test the MapV2 and Filter widgets and their integration.

## Overview

The testing suite includes:
- **Map Widget Tests**: Testing map initialization, marker display, and interactions
- **Filter Widget Tests**: Testing filter functionality in both button and sidebar layouts
- **Integration Tests**: Testing the complete workflow between filter and map widgets
- **Debug Tests**: Specialized tests for debugging the filtering issue where console shows correct results but map doesn't update

## Test Structure

```
tests/
├── fixtures/
│   └── test-data.json          # Sample JSON data for testing
├── utils/
│   ├── wordpress-helper.ts     # WordPress utilities (login, navigation, etc.)
│   └── test-page-helper.ts     # Test page creation and setup
├── map-widget.spec.ts          # Map widget specific tests
├── filter-widget.spec.ts       # Filter widget specific tests
├── integration.spec.ts         # End-to-end integration tests
├── debug-filtering.spec.ts     # Debug tests for filtering issues
└── global-setup.ts             # Global test setup and page creation
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd wp-content/plugins/amfm-maps
npm install
npx playwright install
```

### 2. Configure Environment

Update `playwright.config.ts` with your local WordPress URL:

```typescript
use: {
  baseURL: 'http://your-local-wordpress-site.com',
  // ... other settings
}
```

### 3. WordPress Setup

Before running tests, ensure:
- WordPress is running locally
- AMFM Maps plugin is activated
- Elementor plugin is activated
- Admin user credentials are available (default: admin/password)
- Test JSON data is loaded in the plugin

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test files
npx playwright test map-widget.spec.ts
npx playwright test filter-widget.spec.ts
npx playwright test debug-filtering.spec.ts

# Run tests with debugging
npm run test:debug

# Run tests with UI mode
npm run test:ui

# View test report
npm run test:report
```

## Test Categories

### Map Widget Tests (`map-widget.spec.ts`)
- ✅ Map loads successfully
- ✅ Markers display for locations with PlaceID
- ✅ Info windows work when markers are clicked
- ✅ Results counter updates correctly
- ✅ Handles empty data gracefully
- ✅ Responsive on mobile devices
- ✅ Custom map settings work

### Filter Widget Tests (`filter-widget.spec.ts`)
- ✅ Filter widget loads successfully
- ✅ Button layout displays correctly
- ✅ Sidebar layout displays correctly
- ✅ Filter buttons work and show active state
- ✅ Clear filters functionality
- ✅ Checkbox filters in sidebar
- ✅ Filter events are sent to target maps
- ✅ Custom target map ID functionality
- ✅ Mobile responsiveness

### Integration Tests (`integration.spec.ts`)
- ✅ Complete filtering workflow
- ✅ Error handling during filtering
- ✅ Performance under load
- ✅ Cross-browser compatibility
- ✅ Mobile responsive integration
- ✅ Accessibility compliance

### Debug Tests (`debug-filtering.spec.ts`)
- 🔍 Map object availability during filtering
- 🔍 Step-by-step filtering process
- 🔍 Google Maps Places Service functionality
- 🔍 JSON data and filtering logic

## Debugging the Filtering Issue

The debug tests are specifically designed to help identify why "the filter is not working. Console says that the locations are being filtered and is returning results but the map is not updating."

### Debug Test Features:

1. **Map Object Monitoring**: Checks if the map object exists before and after filtering
2. **Function Call Testing**: Manually calls `applyExternalFilters`, `clearMarkers`, and `loadLocations`
3. **Event System Testing**: Tests custom event dispatching and listening
4. **Places API Testing**: Verifies Google Maps Places Service is working
5. **Data Validation**: Checks JSON data structure and filtering logic

### Running Debug Tests:

```bash
# Run debug tests specifically
npx playwright test debug-filtering.spec.ts

# Run with detailed console output
npx playwright test debug-filtering.spec.ts --headed

# Run single debug test
npx playwright test debug-filtering.spec.ts -g "map object availability"
```

## Environment Variables

The tests use environment variables set by the global setup:
- `TEST_MAP_PAGE_URL`: URL for map-only test page
- `TEST_FILTER_PAGE_URL`: URL for filter-only test page  
- `TEST_FILTER_SIDEBAR_PAGE_URL`: URL for sidebar filter test page
- `TEST_COMPLETE_PAGE_URL`: URL for complete integration test page

## Screenshots and Debugging

Tests automatically capture screenshots for debugging:
- Screenshots saved to `test-results/`
- Debug screenshots saved with descriptive names
- Full page screenshots on test failures
- Videos recorded for failed tests

## Common Issues and Solutions

### 1. Google Maps API Key
Ensure your WordPress site has a valid Google Maps API Key configured in the AMFM Maps plugin settings.

### 2. Test Data
The tests expect JSON data to be available. Use the provided `test-data.json` or ensure your plugin has real data loaded.

### 3. Timing Issues
WordPress and Google Maps can be slow to load. Tests include appropriate waits, but you may need to adjust timeouts for slower environments.

### 4. Element Selectors
If the plugin HTML structure changes, update the selectors in the test files accordingly.

## Continuous Integration

To run these tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: |
    cd wp-content/plugins/amfm-maps
    npm ci
    npx playwright install --with-deps

- name: Run Playwright tests
  run: |
    cd wp-content/plugins/amfm-maps
    npm test
```

## Contributing

When adding new features to the plugin:
1. Add corresponding tests to the appropriate spec file
2. Update test data if new JSON fields are added
3. Run the debug tests to ensure filtering still works
4. Update this README if new test categories are added

## Support

For test-related issues:
1. Check the test output and screenshots
2. Run debug tests to isolate the issue
3. Verify WordPress and plugin setup
4. Check browser console for JavaScript errors
