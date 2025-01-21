// Path: frontend/src/features/settings/useDataManagement.js
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { resetData, updatePityAndStats } from '../../context/appActions';
import { waitForPyWebView } from '../../utils/pywebview-bridge';
import { ActionTypes } from '../../context/appReducer';

export const useDataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { dispatch } = useApp();

  const refreshData = async () => {
    try {
      await waitForPyWebView();
      const result = await window.pywebview.api.get_wish_history();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh data');
      }

      dispatch({
        type: ActionTypes.SET_WISHES,
        payload: result.data
      });

      await updatePityAndStats(dispatch);
      return true;
    } catch (error) {
      console.error('Failed to refresh data:', error);
      return false;
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      setIsExporting(true);
      await waitForPyWebView();
      const result = await window.pywebview.api.export_data(format);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        path: result.path,
        count: result.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (fileContent) => {
    try {
      setIsImporting(true);
      await waitForPyWebView();
      
      // Parse the JSON if it's not already parsed
      const parsedContent = typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent);
      const result = await window.pywebview.api.import_data(parsedContent);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Wait for DB operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data using the same pattern as URL import
      const refreshSuccessful = await refreshData();
      if (!refreshSuccessful) {
        throw new Error('Failed to refresh data after import');
      }
      
      return { success: true, count: result.count };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const result = await resetData(dispatch);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Wait for DB operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data using the same pattern
      const refreshSuccessful = await refreshData();
      if (!refreshSuccessful) {
        throw new Error('Failed to refresh data after reset');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsResetting(false);
    }
  };

  return {
    isExporting,
    isImporting,
    isResetting,
    handleExport,
    handleImport,
    handleReset
  };
};