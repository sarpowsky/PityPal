/* Path: frontend/src/components/UrlImporter.jsx */
import React, { useState } from 'react';
import { Search, History } from 'lucide-react';

const UrlImporter = () => {
  const [url, setUrl] = useState('');

  const handleImport = async () => {
    if (!url) return;
    // Import logic here
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste wish history URL here..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/20 backdrop-blur-sm
                   border border-white/10 text-sm text-white placeholder-white/40
                   focus:outline-none focus:border-white/20 transition-colors"
        />
        <History className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
      </div>
      <button
        onClick={handleImport}
        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500
                 hover:from-indigo-600 hover:to-purple-600 transition-all
                 text-sm text-white font-medium"
      >
        Import
      </button>
    </div>
  );
};

export default UrlImporter;