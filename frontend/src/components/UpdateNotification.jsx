// Path: frontend/src/components/UpdateNotification.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, X, Download, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { waitForPyWebView } from '../utils/pywebview-bridge';
import { useNotification } from '../context/NotificationContext';
import updateEventBus, { UPDATE_CHECK_REQUESTED } from '../utils/updateEventBus';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadResult, setDownloadResult] = useState(null);
  const [downloadPath, setDownloadPath] = useState(null); // Store the download path
  const { showNotification } = useNotification();

  // Poll for download progress
  useEffect(() => {
    let progressInterval;
    
    if (isDownloading) {
      progressInterval = setInterval(async () => {
        try {
          const result = await window.pywebview.api.get_download_progress();
          if (result.success) {
            setDownloadProgress(result.progress);
            
            // If download completed, clear interval and save the path
            if (!result.is_downloading && result.progress >= 100) {
              clearInterval(progressInterval);
              setIsDownloading(false);
              
              // Save download path for installation
              if (result.download_path) {
                console.log("Download completed, path:", result.download_path);
                setDownloadPath(result.download_path);
                
                // Verify file exists
                if (result.file_exists === false) {
                  console.error("Downloaded file not found:", result.download_path);
                  showNotification(
                    'error',
                    'Download Error',
                    'Downloaded file not found'
                  );
                } else {
                  console.log("File verified:", result.file_size, "bytes");
                  setDownloadResult({ 
                    success: true,
                    file_path: result.download_path,
                    extracted_path: result.extracted_path
                  });
                  
                  // Only keep this notification
                  showNotification(
                    'success', 
                    'Download Complete', 
                    'Update has been downloaded successfully!'
                  );
                }
              } else {
                setDownloadResult({ success: true });
                console.warn("Download complete but no path received");
              }
            }
          }
        } catch (error) {
          console.error('Failed to get download progress:', error);
        }
      }, 500);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isDownloading, showNotification]);

  // Check for updates function
  const checkForUpdates = async () => {
    try {
      console.log("Checking for updates...");
      await waitForPyWebView();
      
      // First get the status of the last check
      const statusResult = await window.pywebview.api.get_update_status();
      console.log("Update status received:", statusResult);
      
      if (statusResult.success) {
        setUpdateInfo(statusResult);
        
        // If there's a download path in the status, save it
        if (statusResult.download_path) {
          setDownloadPath(statusResult.download_path);
        }
        
        // Show notification if there's an update available
        if (statusResult.update_available) {
          console.log("Update is available, showing notification");
          setVisible(true);
        } else {
          console.log("No update available");
        }
      } else {
        console.log("Update check failed:", statusResult.error);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  // Initial update check
  useEffect(() => {
    console.log("UpdateNotification component mounted");
    checkForUpdates();
    
    // Check again periodically
    const interval = setInterval(checkForUpdates, 3600000); // Every hour
    
    return () => clearInterval(interval);
  }, []);

  // Listen for update check events from Settings page
  useEffect(() => {
    console.log("Setting up update event listener");
    
    const unsubscribe = updateEventBus.on(UPDATE_CHECK_REQUESTED, async (data) => {
      console.log("Received update check request:", data);
      setUpdateInfo({ checking: true });
      setVisible(true); // Show the checking state
      
      // Wait for the check to complete and then check the status
      setTimeout(async () => {
        await checkForUpdates();
      }, 2500);
    });
    
    return () => unsubscribe();
  }, []);

  const handleManualCheck = async () => {
    try {
      console.log("Manually checking for updates...");
      setUpdateInfo({ checking: true });
      setVisible(true); // Show the checking state
      
      const result = await window.pywebview.api.check_for_updates(true);
      console.log("Manual check result:", result);
      
      if (result.success) {
        // Wait for the background check to complete
        setTimeout(async () => {
          const statusResult = await window.pywebview.api.get_update_status();
          console.log("Status after manual check:", statusResult);
          
          setUpdateInfo(statusResult);
          
          if (statusResult.success && statusResult.update_available) {
            console.log("Update is available after manual check");
            setVisible(true);
          } else {
            // Show only if no update available
            showNotification(
              'info',
              'No Updates Available',
              'Your application is up to date!'
            );
            setVisible(false);
          }
        }, 2000);
      } else {
        setUpdateInfo({ 
          error: result.error || "Failed to check for updates"
        });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setUpdateInfo({ error: error.message });
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadPath(null); // Reset download path
      setDownloadResult(null); // Reset download result
      
      let downloadUrl = null;
      
      // Get the download URL from updateInfo
      if (updateInfo && updateInfo.download_url) {
        downloadUrl = updateInfo.download_url;
      }
      
      if (!downloadUrl) {
        throw new Error("No download URL available");
      }
      
      console.log("Starting download from:", downloadUrl);
      const result = await window.pywebview.api.download_update(downloadUrl);
      console.log("Download start result:", result);
      
      if (!result.success) {
        setIsDownloading(false);
        showNotification(
          'error', 
          'Download Failed', 
          result.error || 'Failed to start download'
        );
      }
    } catch (error) {
      console.error('Failed to download update:', error);
      setIsDownloading(false);
      showNotification(
        'error', 
        'Download Error', 
        error.message
      );
    }
  };

  const handleInstall = async () => {
    try {
      console.log("Installation requested");
      
      // Use the file path from download result or stored download path
      const filePath = downloadPath || 
                      (downloadResult && downloadResult.file_path) ||
                      (updateInfo && updateInfo.download_path);
      
      if (!filePath) {
        console.error("No installation file path available");
        showNotification(
          'error', 
          'Installation Error', 
          'Download file path not found'
        );
        return;
      }
      
      console.log("Installing from:", filePath);
      const result = await window.pywebview.api.install_update(filePath);
      console.log("Install result:", result);
      
      if (result.success) {
        showNotification(
          'success', 
          'Installation Started', 
          'Please follow the installer instructions'
        );
        setVisible(false);
      } else {
        showNotification(
          'error', 
          'Installation Failed', 
          result.error || 'Failed to start installation'
        );
      }
    } catch (error) {
      console.error('Failed to install update:', error);
      showNotification(
        'error', 
        'Installation Error', 
        error.message
      );
    }
  };

  // Debug output to console
  useEffect(() => {
    console.log("Update notification state:", { 
      visible, 
      updateInfo, 
      isDownloading, 
      downloadProgress,
      downloadPath,
      downloadResult 
    });
  }, [visible, updateInfo, isDownloading, downloadProgress, downloadPath, downloadResult]);

  // Don't render if not visible
  if (!visible) return null;

  // Determine what to render based on current state
  let content;
  
  if (isDownloading) {
    // Downloading state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <Download className="text-gray-400" size={20} />
          <h3 className="font-semibold">Downloading update...</h3>
        </div>
        
        <div className="w-full h-3 bg-gray-700 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-full bg-gray-500 transition-all duration-300"
            style={{ width: `${downloadProgress}%` }}
          />
        </div>
        <p className="text-sm text-white/80 mb-4 font-medium">
          Downloading... {downloadProgress}%
        </p>
        
        <button
          disabled
          className="w-full px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-700 border border-gray-600
                   opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={14} />
            <span>Downloading...</span>
          </div>
        </button>
      </>
    );
  } else if (downloadResult && downloadResult.success) {
    // Download complete state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="text-green-400" size={20} />
          <h3 className="font-semibold">Update ready to install</h3>
        </div>
        
        <p className="text-sm mb-4">
          The update has been downloaded and is ready to install. Click the button below to begin installation.
        </p>
        
        <button
          onClick={handleInstall}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium
                   bg-green-500/30 hover:bg-green-500/50 border border-green-500/40
                   transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={14} />
            <span>Install Now</span>
          </div>
        </button>
      </>
    );
  } else if (updateInfo && updateInfo.checking) {
    // Checking for updates state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <Loader className="text-gray-400 animate-spin" size={20} />
          <h3 className="font-semibold">Checking for updates...</h3>
        </div>
        
        <p className="text-sm mb-4">
          Please wait while we check for the latest version...
        </p>
        
        <button
          disabled
          className="w-full px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-700 border border-gray-600
                   opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={14} />
            <span>Checking...</span>
          </div>
        </button>
      </>
    );
  } else if (updateInfo && updateInfo.error) {
    // Error state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-400" size={20} />
          <h3 className="font-semibold">Update check failed</h3>
        </div>
        
        <p className="text-sm mb-4 text-red-400">
          {updateInfo.error}
        </p>
        
        <button
          onClick={handleManualCheck}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-700 hover:bg-gray-600 border border-gray-600
                   transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpCircle size={14} />
            <span>Try Again</span>
          </div>
        </button>
      </>
    );
  } else if (updateInfo && updateInfo.update_available) {
    // Update available state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpCircle className="text-gray-400" size={20} />
          <h3 className="font-semibold">Update Available</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-semibold">
            {updateInfo.latest_version}
          </div>
          <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
            New Version
          </div>
        </div>
        
        <p className="text-sm text-white/80 mb-3">
          A new version of PityPal is available. You're currently using version {updateInfo.current_version}.
        </p>
        
        {updateInfo.release_notes && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Release Notes:</div>
            <div className="text-sm text-white/80 border border-white/10 rounded-lg p-3 bg-black/30 max-h-32 overflow-auto">
              <p style={{ whiteSpace: 'pre-line' }}>{updateInfo.release_notes}</p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium
                     bg-gray-700 hover:bg-gray-600 border border-gray-600
                     transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Download size={14} />
              <span>Download Update</span>
            </div>
          </button>
          
          {updateInfo.download_url && (
            <a
              href={updateInfo.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-sm font-medium
                       bg-white/10 hover:bg-white/20 border border-white/20
                       transition-colors"
              title="Download Manually"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </>
    );
  } else {
    // Default state - no update or initial state
    content = (
      <>
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpCircle className="text-gray-400" size={20} />
          <h3 className="font-semibold">Check for Updates</h3>
        </div>
        
        <p className="text-sm mb-4">
          Check if a new version of PityPal is available.
        </p>
        
        <button
          onClick={handleManualCheck}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium
                   bg-gray-700 hover:bg-gray-600 border border-gray-600
                   transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpCircle size={14} />
            <span>Check for Updates</span>
          </div>
        </button>
      </>
    );
  }

  // Render the notification
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 max-w-md w-full"
    >
      <div className="bg-gray-800/90 rounded-lg 
                    border border-gray-700 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {content}
          </div>
          
          <button 
            onClick={() => setVisible(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UpdateNotification;