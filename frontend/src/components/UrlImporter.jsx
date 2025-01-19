// src/components/UrlImporter.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { waitForPyWebView } from '../utils/pywebview-bridge';

const UrlImporter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useApp();

  const validateUrl = (url) => {
    return url.includes('webstatic-sea.hoyoverse.com') && url.includes('authkey');
  };

  const handleImport = async () => {
    if (!url) return;
    
    if (!validateUrl(url)) {
      setError('Invalid URL. Please use the in-game wish history URL.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await waitForPyWebView();
      const result = await window.pywebview.api.import_wishes(url);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to import wishes');
      }

      dispatch({
        type: 'ADD_WISHES',
        payload: result.data
      });

      setUrl('');
      // You might want to add a success toast here
    } catch (err) {
      setError(err.message);
      console.error('Import failed:', err);
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
              setError(null);
            }}
            placeholder="Paste wish history URL here..."
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/20 backdrop-blur-sm
                    border border-white/10 text-sm text-white placeholder-white/40
                    focus:outline-none focus:border-white/20 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
        </div>
        <button
          onClick={handleImport}
          disabled={loading || !url}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
                  hover:from-indigo-600 hover:to-purple-600 transition-all
                  text-sm text-white font-medium disabled:opacity-50 
                  disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader className="animate-spin" size={16} /> : null}
          <span>{loading ? 'Importing...' : 'Import'}</span>
        </button>
      </div>
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 
                     text-red-400 text-sm animate-fadeIn">
          {error}
        </div>
      )}
    </div>
  );
};

export default UrlImporter;