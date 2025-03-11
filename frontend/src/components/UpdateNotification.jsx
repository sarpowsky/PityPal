// Path: frontend/src/components/UpdateNotification.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { waitForPyWebView } from '../utils/pywebview-bridge';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        await waitForPyWebView();
        const result = await window.pywebview.api.check_for_updates();
        
        if (result.success && result.update_available) {
          setUpdateInfo(result);
          setVisible(true);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };
    
    // Check for updates
    checkForUpdates();
  }, []);

  if (!visible || !updateInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg 
                    border border-indigo-500/30 shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle className="text-indigo-400" size={20} />
              <h3 className="font-semibold">Update Available</h3>
            </div>
            <p className="text-sm mb-1">
              Version {updateInfo.latest_version} is now available
            </p>
            <p className="text-xs text-white/60 mb-3">
              You're currently using version {updateInfo.current_version}
            </p>
            
            {updateInfo.download_url && (
              <a
                href={updateInfo.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1.5 rounded-lg text-sm font-medium
                         bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/40
                         transition-colors"
              >
                Download Update
              </a>
            )}
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