// Path: frontend/src/components/ToastNotification.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, X, Loader2 } from 'lucide-react';

const NOTIFICATION_DURATION = 5000;

export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

const NotificationWrapper = ({ children, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className="fixed top-6 right-6 z-50 max-w-sm w-full shadow-lg"
  >
    <div className="relative bg-gray-900/95 border border-white/10 rounded-lg 
                  backdrop-blur-md shadow-xl overflow-hidden">
      {children}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 
                 transition-colors"
      >
        <X size={14} className="text-white/60" />
      </button>
    </div>
  </motion.div>
);

const NotificationIcon = ({ type }) => {
  switch (type) {
    case NotificationTypes.SUCCESS:
      return (
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Check size={18} className="text-green-400" />
        </div>
      );
    case NotificationTypes.ERROR:
      return (
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertCircle size={18} className="text-red-400" />
        </div>
      );
    case NotificationTypes.LOADING:
      return (
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Loader2 size={18} className="text-blue-400 animate-spin" />
        </div>
      );
    default:
      return null;
  }
};

const ToastNotification = ({ 
  type = NotificationTypes.SUCCESS,
  title,
  message,
  progress = 0,
  autoClose = true,
  actions = [],
  onRemove
}) => {
  useEffect(() => {
    if (type !== NotificationTypes.LOADING && autoClose) {
      const timer = setTimeout(() => {
        onRemove();
      }, NOTIFICATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [type, autoClose, onRemove]);

  return (
    <NotificationWrapper onRemove={onRemove}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <NotificationIcon type={type} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium mb-1">{title}</h3>
            <p className="text-sm text-white/60">{message}</p>
          </div>
        </div>
      </div>

      {type === NotificationTypes.LOADING && (
        <div className="h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </NotificationWrapper>
  );
};

export default ToastNotification;