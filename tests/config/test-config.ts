/**
 * Test configuration for AMFM Maps Playwright tests
 */
export const testConfig = {
  wordpress: {
    baseUrl: 'http://localhost:10003',
    adminUrl: 'http://localhost:10003/wp-admin/',
    username: 'adrian.saycon@amfmhealthcare.com',
    password: 'password'
  },
  
  timeouts: {
    navigation: 30000,
    action: 30000,
    mapLoad: 180000,
    elementorLoad: 30000
  },
  
  selectors: {
    map: {
      container: '[id*="amfm_map_v2_"]',
      mapElement: '[id*="_map"]',
      counter: '[id*="_counter"]',
      googleMap: '.gm-style'
    },
    
    filter: {
      container: '.amfm-filter-container',
      button: '.amfm-filter-button',
      clearButton: '.amfm-clear-filters',
      activeButton: '.amfm-filter-button.active',
      group: '.amfm-filter-group-buttons'
    },
    
    elementor: {
      iframe: '#elementor-preview-iframe',
      addSection: '[data-tooltip="Add New Section"]',
      searchInput: '.elementor-search-input',
      publishButton: '#elementor-panel-saver-button-publish',
      previewButton: '#elementor-panel-saver-button-preview'
    },
    
    wordpress: {
      adminBar: '#wpadminbar',
      loginForm: {
        username: '#user_login',
        password: '#user_pass',
        submit: '#wp-submit'
      }
    }
  },
  
  testData: {
    sampleLocations: [
      {
        Name: 'Test Location 1',
        PlaceID: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        State: 'CA',
        'Details: Gender': 'Male',
        'Conditions: ADHD': 1,
        'Programs: Detox': 1,
        'Accomodations: Pets': 1
      },
      {
        Name: 'Test Location 2', 
        PlaceID: 'ChIJrTLr-GyuEmsRBfy61i59si0',
        State: 'NY',
        'Details: Gender': 'Female',
        'Conditions: Depression': 1,
        'Programs: Outpatient': 1,
        'Accomodations: Family': 1
      }
    ]
  }
};
