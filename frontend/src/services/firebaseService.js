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
  LAST_UPDATED: 'pitypal_content_updated'
};

// Cached content expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Default Firebase configuration
// This will be replaced with your actual Firebase config during deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.remoteConfig = null;
    this.storage = null;
    this.initialized = false;
    this.initPromise = null;
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

    this.initPromise = new Promise(async (resolve) => {
      try {
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
        
        // Fetch and activate Remote Config
        await fetchAndActivate(this.remoteConfig);
        
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
      // Try to get from Firebase first
      if (await this.ensureInitialized()) {
        const bannersConfig = getValue(this.remoteConfig, 'banners');
        if (bannersConfig.asString()) {
          const bannersData = JSON.parse(bannersConfig.asString());
          
          // Cache the data for offline use
          localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(bannersData));
          localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
          
          return bannersData;
        }
      }
      
      // Fallback to local storage if Firebase fails or returns empty
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
   * Get all available images from a storage folder
   * @param {string} folderPath - Path to the folder in storage
   * @returns {Promise<Array>} - Array of image metadata
   */
  async getImagesFromFolder(folderPath) {
    try {
      if (await this.ensureInitialized()) {
        const folderRef = ref(this.storage, folderPath);
        const result = await listAll(folderRef);
        
        const images = [];
        for (const item of result.items) {
          const url = await getDownloadURL(item);
          images.push({
            name: item.name,
            path: item.fullPath,
            url
          });
        }
        
        return images;
      }
      return [];
    } catch (error) {
      console.error(`Error listing images in ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * Check if new content is available
   * @returns {Promise<boolean>} - True if new content is available
   */
  async checkForContentUpdates() {
    try {
      // First ensure Firebase is initialized
      if (await this.ensureInitialized()) {
        // Fetch latest Remote Config
        await fetchAndActivate(this.remoteConfig);
        
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
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing content:', error);
      return false;
    }
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
        return JSON.parse(bannersJson);
      }
      
      // If nothing in local storage, return data from static import
      return require('../data/banners').banners;
    } catch (error) {
      console.error('Error getting local banners:', error);
      // Final fallback to hardcoded static import
      return require('../data/banners').banners;
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
        return JSON.parse(eventsJson);
      }
      
      // If nothing in local storage, return data from static import
      return require('../data/events').events;
    } catch (error) {
      console.error('Error getting local events:', error);
      // Final fallback to hardcoded static import
      return require('../data/events').events;
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
        return JSON.parse(leaksJson);
      }
      
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
    
    return (now - timestamp) > CACHE_EXPIRATION;
  }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;