// Path: frontend/src/components/settings/FirebaseSettings.jsx
import React, { useState } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { Database, Wifi, WifiOff, RefreshCw, Clock, BellOff } from 'lucide-react';

const FirebaseSettings = () => {
  const { 
    firebaseSettings, 
    isLoading,
    toggleOfflineMode,
    toggleAutoUpdate,
    setCacheExpiration,
    refreshContent,
    checkForUpdates,
    clearUpdateNotificationThrottle
  } = useFirebase();
  
  const [cacheHours, setCacheHours] = useState(
    firebaseSettings.cacheExpiration || 24
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOfflineModeToggle = async () => {
    await toggleOfflineMode(!firebaseSettings.offlineMode);
  };

  const handleAutoUpdateToggle = async () => {
    await toggleAutoUpdate(!firebaseSettings.autoUpdate);
  };

  const handleCacheExpirationChange = (e) => {
    setCacheHours(parseInt(e.target.value) || 24);
  };

  const handleCacheExpirationSave = async () => {
    await setCacheExpiration(cacheHours);
  };

  const handleManualRefresh = async () => {
    await refreshContent();
  };

  const handleCheckUpdates = async () => {
    await checkForUpdates();
  };

  const handleClearNotificationThrottle = async () => {
    await clearUpdateNotificationThrottle();
  };

  const lastUpdateText = () => {
    if (!firebaseSettings.lastUpdateCheck) return 'Never';
    
    const lastCheck = new Date(firebaseSettings.lastUpdateCheck);
    const now = new Date();
    const diffHours = Math.floor((now - lastCheck) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-white/80">Game Content</h3>

      {/* Offline Mode */}
      <div className="flex items-center justify-between p-4 rounded-lg 
                    bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            {firebaseSettings.offlineMode ? (
              <WifiOff size={20} className="text-red-400" />
            ) : (
              <Wifi size={20} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium">Offline Mode</h3>
            <p className="text-sm text-white/60 mt-0.5">
              {firebaseSettings.offlineMode
                ? "Using cached data without network connection"
                : "Connect to the network for latest data"
              }
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleOfflineModeToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              firebaseSettings.offlineMode ? 'bg-red-600' : 'bg-gray-700'
            } transition-colors duration-300 focus:outline-none`}
          >
            <span
              className={`${
                firebaseSettings.offlineMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
            />
          </button>
        </div>
      </div>

      {/* Auto Update */}
      <div className="flex items-center justify-between p-4 rounded-lg 
                    bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Automatic Content Updates</h3>
            <p className="text-sm text-white/60 mt-0.5">
              {firebaseSettings.autoUpdate
                ? "Check for content updates automatically"
                : "Only check for content updates when requested"
              }
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleAutoUpdateToggle}
            disabled={isLoading || firebaseSettings.offlineMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              firebaseSettings.offlineMode ? 'bg-gray-800 cursor-not-allowed' :
              (firebaseSettings.autoUpdate ? 'bg-indigo-600' : 'bg-gray-700')
            } transition-colors duration-300 focus:outline-none`}
          >
            <span
              className={`${
                firebaseSettings.autoUpdate ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                firebaseSettings.offlineMode ? 'opacity-50' : 'opacity-100'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cache Expiration */}
      <div className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Cache Expiration</h3>
            <p className="text-sm text-white/60 mt-0.5">
              How long to keep content before checking for updates
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 relative">
          <input
            type="range"
            min="1"
            max="72"
            value={cacheHours}
            onChange={handleCacheExpirationChange}
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <div className="min-w-[50px] text-center text-sm">
              {cacheHours} hrs
            </div>
            <button
              onClick={handleCacheExpirationSave}
              disabled={isLoading || firebaseSettings.offlineMode || cacheHours === firebaseSettings.cacheExpiration}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 
                       border border-white/10 text-xs transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Content Management</h3>
            <p className="text-sm text-white/60 mt-0.5">
              Last updated: {lastUpdateText()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleCheckUpdates}
            disabled={isLoading || firebaseSettings.offlineMode}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10
                     border border-white/10 text-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            Check for Updates
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isLoading || firebaseSettings.offlineMode}
            className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30
                     border border-indigo-500/30 text-indigo-400 text-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            Refresh Content Now
          </button>
        </div>
      </div>

      {/* Advanced Settings (Hidden by default) */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30
                   border border-white/10 text-xs transition-colors"
        >
          {showAdvanced ? 'Hide Advanced' : 'Advanced Settings'}
        </button>
      </div>

      {showAdvanced && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <BellOff size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Notification Controls</h3>
              <p className="text-sm text-white/60 mt-0.5">
                Advanced settings for notifications
              </p>
            </div>
          </div>
          
          <div className="mt-2">
            <button
              onClick={handleClearNotificationThrottle}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30
                       border border-red-500/30 text-red-400 text-sm transition-colors"
            >
              Reset Notification Throttling
            </button>
            <p className="text-xs text-white/60 mt-1">
              This will clear the notification cooldown period. Use only if you want to immediately receive content update notifications.
            </p>
          </div>
        </div>
      )}

      {/* Info text */}
      {firebaseSettings.offlineMode && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 
                      text-sm text-center text-yellow-400">
          Offline mode is enabled. App will not connect to the network for content updates.
        </div>
      )}
    </div>
  );
};

export default FirebaseSettings;