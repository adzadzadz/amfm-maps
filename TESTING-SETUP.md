# AMFM Maps Playwright Testing Setup Summary

## Configuration Applied

### WordPress Environment
- **Base URL**: `http://localhost:10003`
- **Admin URL**: `http://localhost:10003/wp-admin/`
- **Username**: `adrian.saycon@amfmhealthcare.com`
- **Password**: `password`

### Test Configuration Files Updated
1. `playwright.config.ts` - Updated baseURL to http://localhost:10003
2. `tests/utils/wordpress-helper.ts` - Updated with new credentials
3. `tests/config/test-config.ts` - New centralized configuration file
4. `run-tests.sh` - Updated test runner with new environment variables

## Quick Start Commands

```bash
# 1. Verify environment setup
./bin/verify-setup.sh

# 2. Run debugging tests (visible browser)
./bin/run-tests.sh debug

# 3. Run all tests
./bin/run-tests.sh

# 4. Run specific test categories
./bin/run-tests.sh map        # Map widget only
./bin/run-tests.sh filter     # Filter widget only
./bin/run-tests.sh integration # Complete workflow
```

## Files Created/Updated

### Configuration
- `playwright.config.ts` ✓ Updated
- `tests/config/test-config.ts` ✓ New
- `package.json` ✓ Created
- `.github/workflows/test.yml` ✓ Created

### Test Files
- `tests/map-widget.spec.ts` ✓ Created
- `tests/filter-widget.spec.ts` ✓ Created  
- `tests/integration/complete-workflow.spec.ts` ✓ Created
- `tests/debug/filter-debug.spec.ts` ✓ Created

### Utilities
- `tests/utils/wordpress-helper.ts` ✓ Updated
- `tests/utils/test-page-helper.ts` ✓ Created
- `tests/fixtures/test-data.json` ✓ Created
- `tests/global-setup.ts` ✓ Created

### Scripts
- `bin/run-tests.sh` ✓ Updated
- `bin/verify-setup.sh` ✓ Created
- `bin/test-runner.sh` ✓ Created

## Special Debug Features

The `filter-debug.spec.ts` test is specifically designed to help debug the filtering issue where:
- Console shows filtering is working correctly
- Map doesn't update visually

This test includes:
- Detailed console logging
- Step-by-step debugging
- Screenshot capture
- Timing analysis
- Google Maps API monitoring

## Next Steps

1. Run `./bin/verify-setup.sh` to confirm environment
2. Run `./bin/run-tests.sh debug` to start debugging the filter issue
3. Check test reports in `test-results/` folder
