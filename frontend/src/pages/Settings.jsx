// Path: frontend/src/pages/Settings.jsx
import React, { useState } from 'react';
import { Volume2, Upload, Download, Trash2, RotateCw } from 'lucide-react';
import { useDataManagement } from '../features/settings/useDataManagement';
import { useApp } from '../context/AppContext';
import { useAudio } from '../features/audio/AudioSystem';
import ConfirmDialog from '../components/ConfirmDialog';
import { ActionTypes } from '../context/appReducer';
import { loadWishHistory } from '../context/appActions';

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
  const { dispatch } = useApp();
  const { playAudio } = useAudio();
  const { 
    isExporting,
    isImporting,
    isResetting,
    handleExport,
    handleImport,
    handleReset
  } = useDataManagement();

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

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Settings
        </h1>
      </header>

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
          icon={RotateCw} 
          label="Check for Updates"
          description="Check if a new version is available"
        >
          <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                         border border-white/10 text-sm transition-colors">
            Check Now
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

      <div className="text-center text-sm text-white/40 py-4">
        Version 1.0.0
      </div>

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