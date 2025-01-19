// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialState, appReducer } from './appReducer';
import { loadState, saveState } from '../utils/localStorage';
import { loadWishHistory } from './appActions';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const savedSettings = loadState();
    return savedSettings ? { ...initial, settings: savedSettings.settings } : initial;
  });

  // Load initial wish history
  useEffect(() => {
    loadWishHistory(dispatch);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    saveState({ settings: state.settings });
  }, [state.settings]);

  const value = {
    state,
    dispatch,
    isLoading: state.wishes.loading,
    error: state.wishes.error
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};