// Path: frontend/src/context/FirebaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';
import { useNotification } from './NotificationContext';

// Create context
const FirebaseContext = createContext(null);

// Provider component
export const FirebaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentUpdateAvailable, setContentUpdateAvailable] = useState(false);
  const { showNotification } = useNotification();

  // Initialize Firebase on component mount
  useEffect(() => {
    const initFirebase = async () => {
      try {
        setIsLoading(true);
        const success = await firebaseService.initialize();
        setIsInitialized(success);
        
        if (!success) {
          setError('Failed to initialize Firebase. Some features may be unavailable.');
          console.warn('Firebase initialization failed. Using fallback data.');
        }
        
        // Check for content updates
        if (success && firebaseService.isCacheExpired()) {
          const hasUpdates = await firebaseService.checkForContentUpdates();
          setContentUpdateAvailable(hasUpdates);
          
          if (hasUpdates) {
            showNotification(
              'info',
              'Content Update Available',
              'New banners and events are available. Refresh to see the latest content.'
            );
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
      const hasUpdates = await firebaseService.checkForContentUpdates();
      setContentUpdateAvailable(hasUpdates);
      
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

  // Context value
  const value = {
    isInitialized,
    isLoading,
    error,
    contentUpdateAvailable,
    refreshContent,
    checkForUpdates,
    
    // Expose Firebase service methods
    getBanners: firebaseService.getBanners.bind(firebaseService),
    getEvents: firebaseService.getEvents.bind(firebaseService),
    getLeaks: firebaseService.getLeaks.bind(firebaseService),
    getImageUrl: firebaseService.getImageUrl.bind(firebaseService)
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