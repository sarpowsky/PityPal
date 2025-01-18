// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialState, appReducer } from './appReducer';
import { loadState, saveState } from '../utils/localStorage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const savedState = loadState();
    return savedState || initial;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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