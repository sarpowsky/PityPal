// src/context/appActions.js
import { ActionTypes } from './appReducer';
import { waitForPyWebView } from '../utils/pywebview-bridge';

export const importWishHistory = async (dispatch, url) => {
  try {
    await waitForPyWebView();
    
    const result = await window.pywebview.api.import_wishes(url);
    if (!result.success) throw new Error(result.error);

    dispatch({
      type: ActionTypes.ADD_WISHES,
      payload: result.data
    });

    await updatePityAndStats(dispatch);

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

const updatePityAndStats = async (dispatch) => {
  try {
    const [pityResult, wishHistory] = await Promise.all([
      window.pywebview.api.calculate_pity(),
      window.pywebview.api.get_wish_history()
    ]);

    dispatch({
      type: ActionTypes.UPDATE_PITY,
      payload: pityResult
    });

    dispatch({
      type: ActionTypes.UPDATE_STATS,
      payload: wishHistory
    });
  } catch (error) {
    console.error('Failed to update pity and stats:', error);
  }
};

export const updateSettings = (dispatch, settings) => {
  dispatch({
    type: ActionTypes.UPDATE_SETTINGS,
    payload: settings
  });
};

export const exportWishHistory = async () => {
  try {
    await waitForPyWebView();
    return await window.pywebview.api.export_data();
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const resetData = (dispatch) => {
  dispatch({ type: ActionTypes.RESET_DATA });
};