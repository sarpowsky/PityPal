// Path: frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Volume2, Upload, Download, Trash2, RotateCw, Bell, BellOff, Loader2, Info, Github, Mail, RefreshCw, Coffee, Linkedin, Heart, Clock, AlertCircle } from 'lucide-react';
import { useDataManagement } from '../features/settings/useDataManagement';
import { useApp } from '../context/AppContext';
import { useAudio } from '../features/audio/AudioSystem';
import { useFirebase } from '../context/FirebaseContext';
import ConfirmDialog from '../components/ConfirmDialog';
import FirebaseSettings from '../components/settings/FirebaseSettings';
import { ActionTypes } from '../context/appReducer';
import { loadWishHistory } from '../context/appActions';
import { requestNotificationPermission } from '../services/desktopNotificationService';
import { waitForPyWebView } from '../utils/pywebview-bridge';
import { useNotification } from '../context/NotificationContext';
import updateEventBus, { UPDATE_CHECK_REQUESTED } from '../utils/updateEventBus';

const SettingsSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-genshin text-white/80">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const SettingItem = ({ icon: Icon, label, description, children }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm 
                border border-white/10 group hover:bg-black/30 transition-all">
    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-medium">{label}</h3>
      {description && (
        <p className="text-sm text-white/60 mt-0.5">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const LoadingOverlay = ({ progress }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-800/90 rounded-lg p-6 max-w-sm w-full mx-4">
      <div className="space-y-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-white text-sm">Importing data... {progress}%</p>
      </div>
    </div>
  </div>
);

const Settings = () => {
  const [volume, setVolume] = useState(50);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState(24); // Default: daily
  const [currentUpdateFrequency, setCurrentUpdateFrequency] = useState(24);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('app'); // 'app', 'content', 'data', 'about'
  const { dispatch } = useApp();
  const { playAudio } = useAudio();
  const { showNotification } = useNotification();
  const { 
    isExporting,
    isImporting,
    isResetting,
    handleExport,
    handleImport,
    handleReset
  } = useDataManagement();
  
  // Firebase content updates
  const { 
    checkForUpdates: checkForContentUpdates, 
    refreshContent, 
    contentUpdateAvailable,
    isLoading: isFirebaseLoading 
  } = useFirebase();

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await waitForPyWebView();
        // Load auto update setting
        const result = await window.pywebview.api.get_auto_update_setting();
        if (result.success) {
          setAutoUpdate(result.auto_check);
        }
        
        // Load update frequency if API available
        try {
          const statusResult = await window.pywebview.api.get_update_status();
          if (statusResult.success && statusResult.check_frequency) {
            // Convert from seconds to hours if the API provides frequency in seconds
            const frequencyHours = Math.floor((statusResult.check_frequency || 86400) / 3600);
            setUpdateFrequency(frequencyHours);
            setCurrentUpdateFrequency(frequencyHours);
          }
        } catch (error) {
          // If the API doesn't have this method, just ignore the error
          console.log('Update frequency API not available', error);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const onVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    playAudio('buttonClick');
  };

  const onExport = async () => {
    try {
      const result = await handleExport('json');
      if (result.success) {
        alert(`Data exported successfully to: ${result.path}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const onImport = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setIsLoading(true);
          setImportProgress(0);
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              setImportProgress(25);
              const fileContent = event.target.result;
              const result = await handleImport(fileContent);
              
              if (result.success) {
                setImportProgress(75);
                // Force immediate data reload
                await loadWishHistory(dispatch);
                setImportProgress(100);
                setTimeout(() => {
                  setIsLoading(false);
                  alert(`Successfully imported ${result.count} wishes`);
                }, 1000);
              }
            } catch (error) {
              setIsLoading(false);
              alert(`Import failed: ${error.message}`);
            }
          };
          reader.readAsText(file);
        }
      };
      
      input.click();
    } catch (error) {
      setIsLoading(false);
      alert(`Import failed: ${error.message}`);
    }
  };

  const onConfirmReset = async () => {
    try {
      const result = await handleReset();
      if (result.success) {
        setShowResetDialog(false);
        dispatch({ type: ActionTypes.RESET_DATA });
        const historyResult = await window.pywebview.api.get_wish_history();
        if (historyResult.success) {
          dispatch({ type: ActionTypes.SET_WISHES, payload: historyResult.data });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Reset failed: ${error.message}`);
    }
  };

  const handleToggleAutoUpdate = async () => {
    try {
      // Update UI immediately for responsive feel
      setAutoUpdate(!autoUpdate);
      
      // Then update the backend
      await waitForPyWebView();
      const result = await window.pywebview.api.set_auto_update_setting(!autoUpdate);
      
      // If the backend update failed, revert the UI
      if (!result.success) {
        setAutoUpdate(autoUpdate);
        console.error('Failed to update auto-update setting:', result.error);
      }
    } catch (error) {
      // Revert on exception
      setAutoUpdate(autoUpdate);
      console.error('Failed to toggle auto update setting:', error);
    }
  };
  
  const handleSaveUpdateFrequency = async () => {
    try {
      await waitForPyWebView();
      // Check if the API method exists
      if (window.pywebview.api.set_check_frequency) {
        const result = await window.pywebview.api.set_check_frequency(updateFrequency);
        if (result.success) {
          setCurrentUpdateFrequency(updateFrequency);
          showNotification('success', 'Settings Updated', 'Update frequency has been saved');
        } else {
          showNotification('error', 'Settings Error', result.error || 'Failed to save frequency');
        }
      } else {
        console.warn('set_check_frequency API method not available');
      }
    } catch (error) {
      console.error('Failed to save update frequency:', error);
      showNotification('error', 'Settings Error', error.message);
    }
  };
  
  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    
    try {
      // Emit event for UpdateNotification component
      updateEventBus.emit(UPDATE_CHECK_REQUESTED, { timestamp: Date.now() });
      
      await waitForPyWebView();
      const result = await window.pywebview.api.check_for_updates(true);  // Force check
      
      // If the check started successfully, wait for status
      if (result.success) {
        // Wait a bit for the background check to complete
        setTimeout(async () => {
          try {
            const statusResult = await window.pywebview.api.get_update_status();
            setUpdateStatus(statusResult);
            
            // Don't show notifications here - the UpdateNotification component will handle it
            // Just update the local state for the Settings page UI
            
          } catch (error) {
            console.error('Failed to get update status:', error);
            setUpdateStatus({
              success: false,
              error: error.message
            });
          } finally {
            setIsCheckingUpdate(false);
          }
        }, 2000);
      } else {
        setUpdateStatus({
          success: false, 
          error: result.error
        });
        setIsCheckingUpdate(false);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setUpdateStatus({
        success: false,
        error: error.message
      });
      setIsCheckingUpdate(false);
    }
  };
  // Handle content updates
  const handleCheckForContentUpdates = async () => {
    try {
      const hasUpdates = await checkForContentUpdates();
      return hasUpdates;
    } catch (error) {
      console.error('Failed to check for content updates:', error);
      return false;
    }
  };
  
  const handleRefreshContent = async () => {
    try {
      await refreshContent();
      alert('Content updated successfully! The app will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh content:', error);
      alert('Failed to update content. Please try again later.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Settings
        </h1>
      </header>

      {/* Settings Navigation */}
      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-1">
        <button
          onClick={() => setActiveSection('app')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            activeSection === 'app' 
              ? 'bg-white/10 text-white' 
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          App Settings
        </button>
        <button
          onClick={() => setActiveSection('content')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            activeSection === 'content' 
              ? 'bg-white/10 text-white' 
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          Game Content
        </button>
        <button
          onClick={() => setActiveSection('data')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            activeSection === 'data' 
              ? 'bg-white/10 text-white' 
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          Data Management
        </button>
        <button
          onClick={() => setActiveSection('about')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            activeSection === 'about' 
              ? 'bg-white/10 text-white' 
              : 'text-white/60 hover:bg-white/5'
          }`}
        >
          About
        </button>
      </div>

      {/* App Settings Section */}
      {activeSection === 'app' && (
        <>
          <SettingsSection title="Sound">
            <SettingItem 
              icon={Volume2} 
              label="Volume"
              description="Adjust the volume of sound effects"
            >
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={onVolumeChange}
                  className="w-32"
                />
                <span className="text-sm text-white/60 min-w-[2.5rem]">
                  {volume}%
                </span>
              </div>
            </SettingItem>
          </SettingsSection>

          <SettingsSection title="Updates">
            <SettingItem 
              icon={autoUpdate ? Bell : BellOff}
              label="Automatic Updates"
              description="Check for app updates when the application starts"
            >
              <div className="flex items-center">
                <button
                  onClick={handleToggleAutoUpdate}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    autoUpdate ? 'bg-indigo-600' : 'bg-gray-700'
                  } transition-colors duration-300 focus:outline-none`}
                >
                  <span
                    className={`${
                      autoUpdate ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
                  />
                </button>
              </div>
            </SettingItem>
            
            <SettingItem 
              icon={Clock} 
              label="Update Check Frequency"
              description="How often to check for updates automatically"
            >
              <div className="flex items-center gap-2">
                <select
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(Number(e.target.value))}
                  disabled={!autoUpdate}
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
                >
                  <option value={12}>Every 12 hours</option>
                  <option value={24}>Daily</option>
                  <option value={168}>Weekly</option>
                </select>
                
                <button
                  onClick={handleSaveUpdateFrequency}
                  disabled={!autoUpdate || updateFrequency === currentUpdateFrequency}
                  className="px-2 py-1 rounded bg-white/10 text-xs disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </SettingItem>

            <SettingItem 
              icon={RotateCw} 
              label="Check for App Updates"
              description="Check if a new version of PityPal is available"
            >
              <button 
                onClick={handleCheckForUpdates}
                disabled={isCheckingUpdate}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                        border border-white/10 text-sm transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCheckingUpdate ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Check Now</span>
                )}
              </button>
            </SettingItem>

            {/* Show update status */}
            {updateStatus && (
              <div className={`p-3 mt-2 rounded-lg ${
                !updateStatus.success 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : updateStatus.update_available
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              } border`}>
                {!updateStatus.success ? (
                  <p>{updateStatus.error || 'Failed to check for updates'}</p>
                ) : updateStatus.update_available ? (
                  <div>
                    <p className="font-medium">New version available: {updateStatus.latest_version}</p>
                    <p className="mt-1">Current version: {updateStatus.current_version}</p>
                    {updateStatus.download_url && (
                      <a 
                        href={updateStatus.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-lg
                                hover:bg-white/20 transition-colors text-sm"
                      >
                        Download Update
                      </a>
                    )}
                  </div>
                ) : (
                  <p>{updateStatus.message || 'Application is up to date'}</p>
                )}
              </div>
            )}
          </SettingsSection>
        </>
      )}

      {/* Game Content Section */}
      {activeSection === 'content' && (
        <FirebaseSettings />
      )}

      {/* Data Management Section */}
      {activeSection === 'data' && (
        <SettingsSection title="Data Management">
          <SettingItem 
            icon={Upload} 
            label="Import Data"
            description="Import wishes from a JSON file"
          >
            <button 
              onClick={onImport}
              disabled={isImporting || isLoading}
              className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                      border border-white/10 text-sm transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting || isLoading ? 'Importing...' : 'Import'}
            </button>
          </SettingItem>
          
          <SettingItem 
            icon={Download} 
            label="Export Data"
            description="Export your wish history to JSON"
          >
            <button 
              onClick={onExport}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                      border border-white/10 text-sm transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </SettingItem>

          <SettingItem 
            icon={Trash2}
            label="Reset All Data"
            description="Delete all wish history and settings"
          >
            <button
              onClick={() => setShowResetDialog(true)}
              disabled={isResetting}
              className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                      border border-red-500/20 text-red-400 text-sm 
                      transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed"
            >
              {isResetting ? 'Resetting...' : 'Reset'}
            </button>
          </SettingItem>
        </SettingsSection>
      )}
      
      {/* About Section */}
      {activeSection === 'about' && (
        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-5 text-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center mb-4">
              <img src="icons/icon_about.png" alt="PityPal Logo" className="w-20 h-20 mb-3" />
              <h2 className="text-xl font-genshin bg-gradient-to-r from-indigo-300 
                          via-purple-300 to-pink-300 text-transparent bg-clip-text mb-1">
                PityPal
              </h2>
              <p className="text-white/70 text-sm">Your companion and Mona basically, for Genshin Impact</p>
              <div className="text-white/60 text-xs mt-1">Version 1.1</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-black/20 border border-white/10 text-left">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <Info size={16} className="text-indigo-400" />
                  <span>About This App</span>
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  PityPal is a desktop application designed to track and analyze your Genshin Impact wish history. 
                  It provides detailed analytics, pity tracking, and uses machine learning to predict your chances 
                  of getting 5★ characters and weapons.
                </p>
                <p className="text-xs text-white/70">
                  This is a fan-made application and is not affiliated with HoYoverse or Genshin Impact. 
                  All game assets and references are property of HoYoverse.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-black/20 border border-white/10 text-left">
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <Heart size={16} className="text-pink-400" />
                  <span>Support Development</span>
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  If you enjoy using PityPal and would like to support its continued development, 
                  you can consider buying me a coffee or connecting on professional networks.
                </p>
                
                <div className="flex flex-col gap-2">
                  <a 
                    href="https://www.buymeacoffee.com/sarpowsky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 
                           hover:bg-yellow-500/30 border border-yellow-500/30 
                           text-yellow-400 transition-colors text-xs"
                  >
                    <Coffee size={14} />
                    <span>Buy Me a Coffee</span>
                  </a>
                  
                  <a 
                    href="https://www.linkedin.com/in/sarpcankaraman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 
                           hover:bg-blue-500/30 border border-blue-500/30 
                           text-blue-400 transition-colors text-xs"
                  >
                    <Linkedin size={14} />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-3">
              <a 
                href="https://github.com/sarpowsky" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 
                       hover:bg-white/10 border border-white/10 
                       text-white/80 transition-colors text-xs"
              >
                <Github size={14} />
                <span>GitHub</span>
              </a>
              
              <a 
                href="mailto:sarpcankaraman@gmail.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 
                       hover:bg-white/10 border border-white/10 
                       text-white/80 transition-colors text-xs"
              >
                <Mail size={14} />
                <span>Contact Developer</span>
              </a>
            </div>
            
            <div className="text-xs text-white/40 mt-4">
              Made with ❤️ by sarpowsky
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset All Data"
        message="Are you sure you want to reset all data? This action cannot be undone."
        confirmText="Reset Data"
        onConfirm={onConfirmReset}
        onCancel={() => setShowResetDialog(false)}
        isDestructive
      />

      {isLoading && <LoadingOverlay progress={importProgress} />}
    </div>
  );
};

export default Settings;