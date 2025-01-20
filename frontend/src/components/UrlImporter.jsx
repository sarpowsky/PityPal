// Path: frontend/src/components/UrlImporter.jsx
import React, { useState, useRef } from 'react';
import { Search, Loader, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { importWishHistory } from '../context/appActions';

const UrlImporter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const importTimeout = useRef(null);

  const validateUrl = (url) => {
    if (!url) return "Please enter a URL";
    if (!url.includes('public-operation-hk4e') && !url.includes('webstatic-sea.hoyoverse.com')) 
      return "Invalid URL. Please use the in-game wish history URL";
    if (!url.includes('authkey='))
      return "Invalid URL format. Missing authentication key";
    return null;
  };

  const handleImport = async () => {
    setError('');
    const urlError = validateUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }
  
    setLoading(true);
    setProgress(0);
  
    try {
      const result = await importWishHistory(dispatch, url, (progress) => {
        setProgress(progress);
      });
  
      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }
  
      setUrl('');
      // Show success state briefly
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1000);
  
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="Paste wish history URL here..."
            disabled={loading}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full
                     bg-black/20 backdrop-blur-sm
                     border ${error ? 'border-red-500/50'
                     : 'border-white/10'} text-sm text-white 
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

        <button
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
              <Loader className="animate-spin" size={16} />
              <span>{progress}%</span>
            </>
          ) : (
            <span>Import</span>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 
                     transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 px-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UrlImporter;