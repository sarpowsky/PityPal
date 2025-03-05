// Path: frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';
import ToastNotification, { NotificationTypes } from '../components/ToastNotification';
import { getDueReminders } from '../services/reminderService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateNotification = (id, updates) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    updateNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          {...notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  const { addNotification, removeNotification, updateNotification } = context;

  const showNotification = (type, title, message) => {
    return addNotification({ type, title, message });
  };

  const showLoading = (title, message) => {
    return addNotification({
      type: NotificationTypes.LOADING,
      title,
      message,
      progress: 0
    });
  };

  const updateProgress = (id, progress) => {
    updateNotification(id, { progress });
  };

  const dismissNotification = (id) => {
    removeNotification(id);
  };

  return {
    showNotification,
    showLoading,
    updateProgress,
    dismissNotification
  };
};

export default NotificationContext;