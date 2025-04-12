// Path: frontend/src/services/firebaseService.js
import { initializeApp } from 'firebase/app';
import { 
  getRemoteConfig, 
  fetchAndActivate, 
  getValue,
  getAll
} from 'firebase/remote-config';
import { 
  getStorage, 
  ref, 
  getDownloadURL,
  listAll
} from 'firebase/storage';

// Local storage keys for offline fallback
const STORAGE_KEYS = {
  BANNERS: 'pitypal_banners_cache',
  EVENTS: 'pitypal_events_cache',
  LEAKS: 'pitypal_leaks_cache',
  LAST_UPDATED: 'pitypal_content_updated',
  SETTINGS: 'pitypal_firebase_settings'
};

// Default cache settings
const DEFAULT_SETTINGS = {
  autoUpdate: true,        // Automatically check for content updates
  offlineMode: false,      // When true, always use cache first
  cacheExpiration: 24,     // Cache expiration in hours
  lastUpdateCheck: null    // Timestamp of last update check
};

// Cached content expiration time (default 24 hours in milliseconds)
const getDefaultCacheExpiration = () => {
  const settings = getFirebaseSettings();
  return settings.cacheExpiration * 60 * 60 * 1000;
};

// Read firebase settings from local storage
const getFirebaseSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading Firebase settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save firebase settings to local storage
const saveFirebaseSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      ...getFirebaseSettings(),
      ...settings
    }));
    return true;
  } catch (error) {
    console.error('Error saving Firebase settings:', error);
    return false;
  }
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.remoteConfig = null;
    this.storage = null;
    this.initialized = false;
    this.initPromise = null;
    this.settings = getFirebaseSettings();
  }

  /**
   * Initialize Firebase and its services
   * @returns {Promise<boolean>} - True if initialization successful
   */
  async initialize() {
    // If already initialized, return the existing promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // If in offline mode, don't attempt to initialize
    if (this.settings.offlineMode) {
      console.log('Firebase in offline mode - using cached data only');
      return Promise.resolve(false);
    }

    this.initPromise = new Promise(async (resolve) => {
      try {
        // Default Firebase configuration
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
          appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
        };
        
        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);
        
        // Initialize Remote Config
        this.remoteConfig = getRemoteConfig(this.app);
        this.remoteConfig.settings = {
          minimumFetchIntervalMillis: 3600000, // 1 hour
          fetchTimeoutMillis: 60000 // 1 minute
        };
        
        // Initialize Storage
        this.storage = getStorage(this.app);
        
        // Fetch and activate Remote Config if auto-update is enabled
        if (this.settings.autoUpdate) {
          await fetchAndActivate(this.remoteConfig);
          
          // Update last check timestamp
          this.settings.lastUpdateCheck = Date.now();
          saveFirebaseSettings(this.settings);
        }
        
        this.initialized = true;
        console.log('Firebase initialized successfully');
        resolve(true);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        this.initialized = false;
        resolve(false);
      }
    });
    
    return this.initPromise;
  }

  /**
   * Ensure Firebase is initialized before proceeding
   * @returns {Promise<boolean>}
   */
  async ensureInitialized() {
    // Don't try to initialize in offline mode
    if (this.settings.offlineMode) {
      return false;
    }
    
    if (!this.initialized) {
      return await this.initialize();
    }
    return this.initialized;
  }

  /**
   * Get banner data from Remote Config with offline fallback
   * @returns {Promise<Array>} - Banner data
   */
  async getBanners() {
    try {
      // In offline mode, always use cached data
      if (this.settings.offlineMode) {
        console.log('Firebase: Using cached banners (offline mode)');
        return this.getLocalBanners();
      }
      
      // Try to get from Firebase first
      if (await this.ensureInitialized()) {
        console.log('Firebase: Getting banners from Remote Config');
        const bannersConfig = getValue(this.remoteConfig, 'banners');
        if (bannersConfig && bannersConfig.asString()) {
          const bannersJson = bannersConfig.asString();
          try {
            const bannersData = JSON.parse(bannersJson);
            
            // Cache the data for offline use
            localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(bannersData));
            localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
            console.log('Firebase: Received and cached banners data');
            
            return bannersData;
          } catch (parseError) {
            console.error('Error parsing banners JSON:', parseError);
          }
        } else {
          console.log('Firebase: No banners data in Remote Config');
        }
      } else {
        console.log('Firebase: Not initialized, using local data');
      }
      
      // Fallback to local storage if Firebase fails or returns empty
      console.log('Firebase: Falling back to local banners data');
      return this.getLocalBanners();
    } catch (error) {
      console.error('Error fetching banners:', error);
      return this.getLocalBanners();
    }
  }

  /**
   * Get event data from Remote Config with offline fallback
   * @returns {Promise<Array>} - Event data
   */
  async getEvents() {
    try {
      // In offline mode, always use cached data
      if (this.settings.offlineMode) {
        return this.getLocalEvents();
      }
      
      // Try to get from Firebase first
      if (await this.ensureInitialized()) {
        const eventsConfig = getValue(this.remoteConfig, 'events');
        if (eventsConfig.asString()) {
          const eventsData = JSON.parse(eventsConfig.asString());
          
          // Cache the data for offline use
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventsData));
          localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
          
          return eventsData;
        }
      }
      
      // Fallback to local storage if Firebase fails or returns empty
      return this.getLocalEvents();
    } catch (error) {
      console.error('Error fetching events:', error);
      return this.getLocalEvents();
    }
  }

  /**
   * Get leak data from Remote Config with offline fallback
   * @returns {Promise<Object>} - Leak data
   */
  async getLeaks() {
    try {
      // In offline mode, always use cached data
      if (this.settings.offlineMode) {
        return this.getLocalLeaks();
      }
      
      // Try to get from Firebase first
      if (await this.ensureInitialized()) {
        const leaksConfig = getValue(this.remoteConfig, 'leaks');
        if (leaksConfig.asString()) {
          const leaksData = JSON.parse(leaksConfig.asString());
          
          // Cache the data for offline use
          localStorage.setItem(STORAGE_KEYS.LEAKS, JSON.stringify(leaksData));
          
          return leaksData;
        }
      }
      
      // Fallback to local storage if Firebase fails or returns empty
      return this.getLocalLeaks();
    } catch (error) {
      console.error('Error fetching leaks:', error);
      return this.getLocalLeaks();
    }
  }

  /**
   * Get image URL from Firebase Storage
   * @param {string} path - Path to the image in storage
   * @returns {Promise<string>} - Image URL
   */
  async getImageUrl(path) {
    try {
      if (this.settings.offlineMode) {
        // In offline mode, return null or a placeholder
        return null;
      }
      
      if (await this.ensureInitialized()) {
        const imageRef = ref(this.storage, path);
        const url = await getDownloadURL(imageRef);
        return url;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching image ${path}:`, error);
      return null;
    }
  }

  /**
   * Check if new content is available
   * @returns {Promise<boolean>} - True if new content is available
   */
  async checkForContentUpdates() {
    try {
      // In offline mode, don't check for updates
      if (this.settings.offlineMode) {
        return false;
      }
      
      // First ensure Firebase is initialized
      if (await this.ensureInitialized()) {
        // Fetch latest Remote Config
        await fetchAndActivate(this.remoteConfig);
        
        // Update last check timestamp
        this.settings.lastUpdateCheck = Date.now();
        saveFirebaseSettings(this.settings);
        
        // Get the last update timestamp from Remote Config
        const remoteTimestamp = getValue(this.remoteConfig, 'content_updated_at');
        if (!remoteTimestamp.asString()) {
          return false;
        }
        
        // Get the last local update timestamp
        const localTimestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
        if (!localTimestamp) {
          return true; // No local timestamp means new content
        }
        
        // Compare timestamps
        return parseInt(remoteTimestamp.asString()) > parseInt(localTimestamp);
      }
      return false;
    } catch (error) {
      console.error('Error checking for content updates:', error);
      return false;
    }
  }

  /**
   * Force refresh Remote Config and update local cache
   * @returns {Promise<boolean>} - True if refresh successful
   */
  async refreshContent() {
    try {
      // Can't refresh in offline mode
      if (this.settings.offlineMode) {
        return false;
      }
      
      if (await this.ensureInitialized()) {
        // Fetch and activate with cache busting
        await fetchAndActivate(this.remoteConfig);
        
        // Update all local caches
        const configs = getAll(this.remoteConfig);
        
        if (configs.banners && configs.banners.asString()) {
          localStorage.setItem(STORAGE_KEYS.BANNERS, configs.banners.asString());
        }
        
        if (configs.events && configs.events.asString()) {
          localStorage.setItem(STORAGE_KEYS.EVENTS, configs.events.asString());
        }
        
        if (configs.leaks && configs.leaks.asString()) {
          localStorage.setItem(STORAGE_KEYS.LEAKS, configs.leaks.asString());
        }
        
        // Update the last updated timestamp
        if (configs.content_updated_at && configs.content_updated_at.asString()) {
          localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, configs.content_updated_at.asString());
        } else {
          localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
        }
        
        // Update last check timestamp
        this.settings.lastUpdateCheck = Date.now();
        saveFirebaseSettings(this.settings);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing content:', error);
      return false;
    }
  }

  /**
   * Set Firebase settings - persists to localStorage
   * @param {Object} newSettings - Settings to update
   * @returns {boolean} - Success status
   */
  setSettings(newSettings) {
    try {
      // Update instance settings
      this.settings = {
        ...this.settings,
        ...newSettings
      };
      
      // Save to localStorage
      return saveFirebaseSettings(this.settings);
    } catch (error) {
      console.error('Error updating Firebase settings:', error);
      return false;
    }
  }

  /**
   * Get current Firebase settings
   * @returns {Object} - Current settings
   */
  getSettings() {
    return this.settings;
  }

  /**
   * Toggle offline mode
   * @param {boolean} enabled - Whether to enable offline mode
   * @returns {boolean} - Success status
   */
  setOfflineMode(enabled) {
    return this.setSettings({ offlineMode: !!enabled });
  }

  /**
   * Toggle auto update
   * @param {boolean} enabled - Whether to enable auto updates
   * @returns {boolean} - Success status
   */
  setAutoUpdate(enabled) {
    return this.setSettings({ autoUpdate: !!enabled });
  }

  /**
   * Set cache expiration time
   * @param {number} hours - Expiration time in hours
   * @returns {boolean} - Success status
   */
  setCacheExpiration(hours) {
    return this.setSettings({ cacheExpiration: hours });
  }

  // Fallback methods to get data from local storage

  /**
   * Get banners from local storage fallback
   * @returns {Array} - Banner data
   */
  getLocalBanners() {
    try {
      // Get from local storage
      const bannersJson = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (bannersJson) {
        console.log('Firebase: Using cached banners from localStorage');
        return JSON.parse(bannersJson);
      }
      
      console.log('Firebase: No cached banners, using static fallback data');
      // If nothing in local storage, return data from static import
      // Import the banners from the global scope
      return window.defaultBanners || [];
    } catch (error) {
      console.error('Error getting local banners:', error);
      // Final fallback to empty array with a placeholder
      return [{
        id: "fallback",
        name: "Fallback Banner",
        isPermanent: true,
        image: "/banners/placeholder.png"
      }];
    }
  }

  /**
   * Get events from local storage fallback
   * @returns {Array} - Event data
   */
  getLocalEvents() {
    try {
      // Get from local storage
      const eventsJson = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (eventsJson) {
        console.log('Firebase: Using cached events from localStorage');
        return JSON.parse(eventsJson);
      }
      
      console.log('Firebase: No cached events, using static fallback data');
      // If nothing in local storage, return data from window global
      return window.defaultEvents || [];
    } catch (error) {
      console.error('Error getting local events:', error);
      // Final fallback to placeholder
      return [{
        id: "fallback",
        name: "Fallback Event",
        description: "No events available offline",
        image: "/events/placeholder.png"
      }];
    }
  }

  /**
   * Get leaks from local storage fallback
   * @returns {Object} - Leak data
   */
  getLocalLeaks() {
    try {
      // Get from local storage
      const leaksJson = localStorage.getItem(STORAGE_KEYS.LEAKS);
      if (leaksJson) {
        console.log('Firebase: Using cached leaks from localStorage');
        return JSON.parse(leaksJson);
      }
      
      console.log('Firebase: No cached leaks, using empty structure');
      // If no leaks in local storage, return empty structure
      return {
        version: "Unknown",
        phases: [],
        lastUpdated: null
      };
    } catch (error) {
      console.error('Error getting local leaks:', error);
      return {
        version: "Unknown",
        phases: [],
        lastUpdated: null
      };
    }
  }

  /**
   * Check if local cache is expired
   * @returns {boolean} - True if cache is expired
   */
  isCacheExpired() {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    if (!lastUpdated) {
      return true;
    }
    
    const timestamp = parseInt(lastUpdated);
    const now = Date.now();
    
    return (now - timestamp) > getDefaultCacheExpiration();
  }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;