// Path: frontend/src/components/UrlImporter.jsx
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { importWishHistory } from '../context/appActions';

const UrlImporter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();

  const handleImport = async () => {
    if (!url) return;
    setLoading(true);
    
    try {
      const result = await importWishHistory(dispatch, url);
      if (!result.success) {
        throw new Error(result.error);
      }
      setUrl('');
      // Toast notification would go here
    } catch (error) {
      // Error toast would go here
      console.error('Import failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
  );
};

export default UrlImporter;