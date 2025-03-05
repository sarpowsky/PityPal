// Path: frontend/src/services/desktopNotificationService.js

/**
 * Service for handling desktop notifications
 */

// Check if desktop notifications are supported and permission is granted
export const checkNotificationPermission = async () => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return false;
    }
    
    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      return true;
    }
    
    // Request permission if not denied
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  };
  
  // Request notification permission
  export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return { success: false, error: 'Notifications not supported' };
    }
    
    try {
      const permission = await Notification.requestPermission();
      return { 
        success: permission === 'granted',
        permission 
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Show a desktop notification
  export const showDesktopNotification = async (title, options = {}) => {
    // Default options
    const defaultOptions = {
      body: '',
      icon: '/icon.png',
      badge: '/badge.png',
      silent: false,
      vibrate: [200, 100, 200],
      requireInteraction: true, // Don't auto-close
      ...options
    };
    
    // Check permission
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return false;
    }
    
    try {
      // Create notification
      const notification = new Notification(title, defaultOptions);
      
      // Handle click
      if (options.onClick) {
        notification.onclick = (event) => {
          event.preventDefault();
          options.onClick(event);
          notification.close();
        };
      }
      
      // Handle close
      if (options.onClose) {
        notification.onclose = options.onClose;
      }
      
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  };
  
  // Request permissions on app load
  export const initializeNotifications = async () => {
    return await checkNotificationPermission();
  };