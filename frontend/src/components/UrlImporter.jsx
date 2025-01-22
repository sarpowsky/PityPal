// Path: frontend/src/components/UrlImporter.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { importWishHistory } from '../context/appActions';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const UrlImporter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const { dispatch } = useApp();
  const { showNotification, showLoading, updateProgress, dismissNotification } = useNotification();
  const importTimeout = useRef(null);
  const notificationId = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const simulateProgress = () => {
    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += Math.random() * 2;
      if (currentProgress > 90) {
        clearInterval(progressInterval.current);
        return;
      }
      setDisplayProgress(Math.min(Math.round(currentProgress), 90));
    }, 200);
  };

  const validateUrl = (url) => {
    if (!url) return "Please enter a URL";
    if (!url.includes('public-operation-hk4e') && !url.includes('webstatic-sea.hoyoverse.com')) 
      return "Invalid URL. Please use the in-game wish history URL";
    if (!url.includes('authkey='))
      return "Invalid URL format. Missing authentication key";
    return null;
  };

  const handleImport = async () => {
    const urlError = validateUrl(url);
    if (urlError) {
      showNotification('error', 'Import Error', urlError);
      return;
    }
  
    setLoading(true);
    setProgress(0);
    setDisplayProgress(0);
    simulateProgress();
    
    notificationId.current = showLoading(
      'Importing Wishes',
      'Please wait while we fetch your wish history...'
    );
  
    try {
      const result = await importWishHistory(dispatch, url, (currentProgress) => {
        setProgress(currentProgress);
        updateProgress(notificationId.current, currentProgress);
      });
  
      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }
  
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      setDisplayProgress(100);
      updateProgress(notificationId.current, 100);
  
      setTimeout(() => {
        dismissNotification(notificationId.current);
        showNotification(
          'success',
          'Import Complete',
          'Successfully imported your wish history!'
        );
        setUrl('');
        setLoading(false);
        setProgress(0);
        setDisplayProgress(0);
      }, 500);
  
    } catch (error) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      dismissNotification(notificationId.current);
      showNotification(
        'error',
        'Import Failed',
        error.message || 'Failed to import wish history'
      );
      setLoading(false);
      setProgress(0);
      setDisplayProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste wish history URL here..."
            disabled={loading}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full
                     bg-black/20 backdrop-blur-sm
                     border border-white/10 text-sm text-white 
                     placeholder-white/40 focus:outline-none 
                     focus:border-white/20 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed`}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleImport()}
          />
          <Search 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" 
            size={16} 
          />
          
          {url && !loading && (
            <button
              onClick={() => setUrl('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 
                       p-1 rounded-full hover:bg-white/10"
            >
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImport}
          disabled={loading || !url}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r 
                   from-indigo-500 to-purple-500
                   hover:from-indigo-600 hover:to-purple-600 
                   transition-all text-sm text-white font-medium 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   flex items-center gap-2 min-w-[100px]
                   justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>{displayProgress}%</span>
            </>
          ) : (
            <span>Import</span>
          )}
        </motion.button>
      </motion.div>

      {/* Progress bar */}
      {loading && (
        <div className="mt-4 space-y-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>Importing wish history...</span>
            <span>{displayProgress}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlImporter;