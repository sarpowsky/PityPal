// Path: frontend/src/features/FeaturesIntegration.jsx
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { waitForPyWebView } from '../utils/pywebview-bridge';
import { useNotification } from '../context/NotificationContext';

/**
 * This component is responsible for integrating the enhanced features
 * into the application. It should be rendered in App.jsx.
 */
const FeaturesIntegration = ({ isDevMode = false }) => {
  const { dispatch } = useApp();
  const { showNotification } = useNotification();

  // Check if PyWebView is ready and the API is available
  useEffect(() => {
    // Flag to track if initialization has already happened
    const hasInitialized = localStorage.getItem('app_initialized');
    
    const checkPyWebView = async () => {
      try {
        // Wait for PyWebView API to be available
        await waitForPyWebView();
        console.log("PyWebView API is ready");
        
        // Verify API methods
        if (!window.pywebview.api) {
          throw new Error("PyWebView API not found");
        }
        
        const requiredMethods = [
          'import_wishes',
          'get_wish_history',
          'predict_wishes',
          'calculate_pity'
        ];
        
        const missingMethods = requiredMethods.filter(
          method => !window.pywebview.api[method]
        );
        
        if (missingMethods.length > 0) {
          throw new Error(`Missing API methods: ${missingMethods.join(', ')}`);
        }
        
        // API is ready - initialize app features
        initializeApp();
      } catch (error) {
        console.error("PyWebView API initialization error:", error);
        
        if (isDevMode) {
          showNotification(
            'error',
            'API Initialization Failed',
            `Unable to initialize PyWebView API: ${error.message}`
          );
        }
      }
    };
    
    checkPyWebView();
  }, [dispatch, showNotification, isDevMode]);
  
  // Initialize application features
  const initializeApp = async () => {
    try {
      // Load app data (like wish history)
      const historyResult = await window.pywebview.api.get_wish_history();
      if (!historyResult.success) {
        throw new Error(historyResult.error || "Failed to load wish history");
      }
      
      // Update UI with loaded data
      console.log("Initial data load successful");
      
    } catch (error) {
      console.error("App initialization error:", error);
      
      if (isDevMode) {
        showNotification(
          'error',
          'Initialization Error',
          `Error loading app data: ${error.message}`
        );
      }
    }
  };

  // This component doesn't render anything
  return null;
};

export default FeaturesIntegration;