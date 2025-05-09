// src/context/appActions.js
import { ActionTypes } from './appReducer';
import { waitForPyWebView } from '../utils/pywebview-bridge';

export const importWishHistory = async (dispatch, url, progressCallback) => {
  dispatch({ type: ActionTypes.SET_LOADING, payload: true });
  dispatch({ type: ActionTypes.SET_ERROR, payload: null });

  try {
    await waitForPyWebView();
    const handleProgress = (progress) => {
      if (progressCallback) {
        progressCallback(progress);
      }
    };

    const result = await window.pywebview.api.import_wishes(url, handleProgress);
    
    if (!result.success) {
      throw new Error(result.error || 'Import failed');
    }

    dispatch({
      type: ActionTypes.ADD_WISHES,
      payload: result.data
    });

    await updatePityAndStats(dispatch);
    return { success: true };
  } catch (error) {
    dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: error.message 
    });
    return { 
      success: false, 
      error: error.message 
    };
  } finally {
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  }
};

export const updatePityAndStats = async (dispatch) => {
  try {
    const result = await window.pywebview.api.calculate_pity();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('[appActions] Pity data from backend:', result.data);
    
    dispatch({
      type: ActionTypes.UPDATE_PITY,
      payload: {
        character: result.data.character,
        weapon: result.data.weapon,
        permanent: result.data.permanent
      }
    });

    dispatch({
      type: ActionTypes.UPDATE_STATS,
      payload: result.data.stats
    });
  } catch (error) {
    dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: 'Failed to update pity calculations' 
    });
  }
};

export const loadWishHistory = async (dispatch) => {
  dispatch({ type: ActionTypes.SET_LOADING, payload: true });

  try {
    await waitForPyWebView();
    const result = await window.pywebview.api.get_wish_history();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    dispatch({
      type: ActionTypes.SET_WISHES,
      payload: result.data
    });

    await updatePityAndStats(dispatch);
  } catch (error) {
    dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: error.message 
    });
  } finally {
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  }
};

export const exportWishHistory = async () => {
  try {
    await waitForPyWebView();
    const result = await window.pywebview.api.export_data();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateSettings = (dispatch, settings) => {
  dispatch({
    type: ActionTypes.UPDATE_SETTINGS,
    payload: settings
  });
  
  // Persist settings to storage
  try {
    localStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const resetData = async (dispatch) => {
  try {
    await waitForPyWebView();
    const result = await window.pywebview.api.reset_data();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    dispatch({ type: ActionTypes.RESET_DATA });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const checkForUpdates = async () => {
  try {
    await waitForPyWebView();
    const result = await window.pywebview.api.check_updates();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};