// Path: frontend/src/debug/FrontendDiagnostic.jsx
import React, { useState, useEffect } from 'react';
import { waitForPyWebView } from '../utils/pywebview-bridge';

const FrontendDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    reactLoaded: true,
    pywebviewReady: false,
    apiMethods: [],
    moduleChecks: {
      framerMotion: typeof window.framerMotion !== 'undefined',
      recharts: typeof window.Recharts !== 'undefined',
      lucide: typeof window.lucide !== 'undefined'
    },
    error: null
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Check if PyWebView is ready
        await waitForPyWebView();
        const apiMethodsAvailable = window.pywebview && window.pywebview.api ? 
          Object.keys(window.pywebview.api) : [];
        
        setDiagnostics(prev => ({
          ...prev,
          pywebviewReady: true,
          apiMethods: apiMethodsAvailable
        }));
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          error: error.message
        }));
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-6 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10">
      <h2 className="text-xl font-medium mb-4">Frontend Diagnostic Results</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-black/20 border border-white/10">
            <div className="text-sm font-medium mb-1">React Status</div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${diagnostics.reactLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{diagnostics.reactLoaded ? 'Loaded' : 'Not Loaded'}</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-black/20 border border-white/10">
            <div className="text-sm font-medium mb-1">PyWebView Status</div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${diagnostics.pywebviewReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{diagnostics.pywebviewReady ? 'Ready' : 'Not Ready'}</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-black/20 border border-white/10">
          <div className="text-sm font-medium mb-2">API Methods Available</div>
          {diagnostics.apiMethods.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {diagnostics.apiMethods.map(method => (
                <div key={method} className="text-xs px-2 py-1 bg-indigo-500/10 rounded">
                  {method}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/60">No API methods found</div>
          )}
        </div>
        
        <div className="p-3 rounded-lg bg-black/20 border border-white/10">
          <div className="text-sm font-medium mb-2">Required Modules</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(diagnostics.moduleChecks).map(([module, isLoaded]) => (
              <div key={module} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{module}: {isLoaded ? 'Loaded' : 'Not Loaded'}</span>
              </div>
            ))}
          </div>
        </div>
        
        {diagnostics.error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <div className="text-sm font-medium mb-1">Error</div>
            <div className="text-sm">{diagnostics.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrontendDiagnostic;