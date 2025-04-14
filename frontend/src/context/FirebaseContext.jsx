// Path: frontend/src/context/FirebaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';
import { useNotification } from './NotificationContext';

// Content update notification throttling constants
const NOTIFICATION_THROTTLE_KEY = 'content_update_notification_last_shown';
const NOTIFICATION_THROTTLE_HOURS = 6; // Only show content update notification every 6 hours

// Create context
const FirebaseContext = createContext(null);

// Provider component
export const FirebaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentUpdateAvailable, setContentUpdateAvailable] = useState(false);
  const [firebaseSettings, setFirebaseSettings] = useState({});
  const { showNotification } = useNotification();

  // Check if content update notification should be throttled
  const shouldThrottleContentNotification = () => {
    try {
      const lastShown = localStorage.getItem(NOTIFICATION_THROTTLE_KEY);
      if (!lastShown) return false;
      
      const lastTime = parseInt(lastShown, 10);
      const now = Date.now();
      const hoursSinceLastNotification = (now - lastTime) / (1000 * 60 * 60);
      
      return hoursSinceLastNotification < NOTIFICATION_THROTTLE_HOURS;
    } catch (err) {
      console.error('Error checking notification throttle:', err);
      return false;
    }
  };

  // Update the last notification timestamp
  const updateNotificationTimestamp = () => {
    try {
      localStorage.setItem(NOTIFICATION_THROTTLE_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error updating notification timestamp:', err);
    }
  };

  // Initialize Firebase on component mount
  useEffect(() => {
    const initFirebase = async () => {
      try {
        setIsLoading(true);
        
        // Get current settings first
        const settings = firebaseService.getSettings();
        setFirebaseSettings(settings);
        
        // If in offline mode, don't try to initialize Firebase
        if (settings.offlineMode) {
          console.log('Firebase in offline mode - using cached data');
          setIsInitialized(false);
          setIsLoading(false);
          return;
        }
        
        const success = await firebaseService.initialize();
        setIsInitialized(success);
        
        if (!success) {
          setError('Failed to initialize Firebase. Using cached data for offline use.');
          console.warn('Firebase initialization failed. Using fallback data.');
        }
        
        // Check for content updates if auto-update is enabled
        if (success && settings.autoUpdate) {
          // Check only if cache is expired or has never been updated
          if (firebaseService.isCacheExpired()) {
            const hasUpdates = await firebaseService.checkForContentUpdates();
            setContentUpdateAvailable(hasUpdates);
            
            // Only show notification if not throttled
            if (hasUpdates && !shouldThrottleContentNotification()) {
              showNotification(
                'info',
                'Content Update Available',
                'New banners and events are available. Refresh to see the latest content.'
              );
              updateNotificationTimestamp();
            }
          }
        }
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError('Error initializing Firebase. Some features may be unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    initFirebase();
  }, [showNotification]);

  // Function to refresh content
  const refreshContent = async () => {
    try {
      setIsLoading(true);
      
      // Can't refresh in offline mode
      if (firebaseSettings.offlineMode) {
        showNotification(
          'error',
          'Offline Mode Active',
          'Cannot update content in offline mode. Please disable offline mode first.'
        );
        return false;
      }
      
      const success = await firebaseService.refreshContent();
      
      if (success) {
        setContentUpdateAvailable(false);
        showNotification(
          'success',
          'Content Updated',
          'The latest game content has been loaded successfully.'
        );
        return true;
      } else {
        showNotification(
          'error',
          'Update Failed',
          'Failed to update content. Please try again later.'
        );
        return false;
      }
    } catch (err) {
      console.error('Content refresh error:', err);
      showNotification(
        'error',
        'Update Error',
        'An error occurred while updating content.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check for content updates
  const checkForUpdates = async () => {
    try {
      // Can't check updates in offline mode
      if (firebaseSettings.offlineMode) {
        showNotification(
          'info',
          'Offline Mode Active',
          'Content updates are disabled in offline mode.'
        );
        return false;
      }
      
      const hasUpdates = await firebaseService.checkForContentUpdates();
      setContentUpdateAvailable(hasUpdates);
      
      // Always show notification for manual checks (don't throttle)
      if (hasUpdates) {
        showNotification(
          'info',
          'Content Update Available',
          'New banners and events are available.'
        );
      } else {
        showNotification(
          'info',
          'Content Up to Date',
          'Your content is already up to date.'
        );
      }
      
      return hasUpdates;
    } catch (err) {
      console.error('Update check error:', err);
      return false;
    }
  };

  // Clear update notification throttle (for testing/debug)
  const clearUpdateNotificationThrottle = () => {
    try {
      localStorage.removeItem(NOTIFICATION_THROTTLE_KEY);
      return true;
    } catch (err) {
      console.error('Error clearing notification throttle:', err);
      return false;
    }
  };

  // Toggle offline mode
  const toggleOfflineMode = async (enabled) => {
    try {
      const success = firebaseService.setOfflineMode(enabled);
      
      if (success) {
        setFirebaseSettings({
          ...firebaseSettings,
          offlineMode: enabled
        });
        
        showNotification(
          'success',
          enabled ? 'Offline Mode Enabled' : 'Offline Mode Disabled',
          enabled 
            ? 'App will use cached data without connecting to the network.'
            : 'App will connect to the network for the latest data.'
        );
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error toggling offline mode:', err);
      return false;
    }
  };

  // Toggle auto update setting
  const toggleAutoUpdate = async (enabled) => {
    try {
      const success = firebaseService.setAutoUpdate(enabled);
      
      if (success) {
        setFirebaseSettings({
          ...firebaseSettings,
          autoUpdate: enabled
        });
        
        showNotification(
          'success',
          enabled ? 'Auto Updates Enabled' : 'Auto Updates Disabled',
          enabled 
            ? 'App will automatically check for content updates.'
            : 'Content updates will only happen when manually requested.'
        );
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error toggling auto update:', err);
      return false;
    }
  };

  // Set cache expiration time
  const setCacheExpiration = async (hours) => {
    try {
      const success = firebaseService.setCacheExpiration(hours);
      
      if (success) {
        setFirebaseSettings({
          ...firebaseSettings,
          cacheExpiration: hours
        });
        
        showNotification(
          'success',
          'Cache Settings Updated',
          `Cache will now expire after ${hours} hours.`
        );
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error setting cache expiration:', err);
      return false;
    }
  };

  // Wrap Firebase service methods to ensure they work correctly
  const getBanners = async () => {
    return await firebaseService.getBanners();
  };
  
  const getEvents = async () => {
    return await firebaseService.getEvents();
  };
  
  const getLeaks = async () => {
    return await firebaseService.getLeaks();
  };
  
  const getImageUrl = async (path) => {
    return await firebaseService.getImageUrl(path);
  };

  // Context value
  const value = {
    isInitialized,
    isLoading,
    error,
    contentUpdateAvailable,
    firebaseSettings,
    refreshContent,
    checkForUpdates,
    toggleOfflineMode,
    toggleAutoUpdate,
    setCacheExpiration,
    clearUpdateNotificationThrottle,
    
    // Expose wrapped Firebase service methods
    getBanners,
    getEvents,
    getLeaks,
    getImageUrl
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook for using the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export default FirebaseContext;