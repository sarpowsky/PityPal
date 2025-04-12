// Path: frontend/src/data/defaultData.js

import { banners } from './banners';
import { events } from './events';

/**
 * Registers default data in the global scope to be used as fallbacks
 * when Firebase is unavailable or offline mode is enabled
 */
export const registerDefaultData = () => {
  // Register banners data
  window.defaultBanners = banners;
  
  // Register events data
  window.defaultEvents = events;
  
  console.log('Default data registered for offline use');
};

// Export the default data directly as well
export { banners, events };