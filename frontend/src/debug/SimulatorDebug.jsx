// Path: frontend/src/debug/SimulatorDebug.jsx
import React from 'react';

const SimulatorDebug = () => {
  const checkModules = () => {
    const modules = [
      { name: 'React', check: () => typeof React !== 'undefined' },
      { name: 'React DOM', check: () => typeof window.ReactDOM !== 'undefined' },
      { name: 'Framer Motion', check: () => typeof window.framerMotion !== 'undefined' },
      { name: 'Lucide React', check: () => typeof window.lucide !== 'undefined' }
    ];

    return modules.map(module => ({
      ...module, 
      available: (() => {
        try {
          return module.check();
        } catch (e) {
          return false;
        }
      })()
    }));
  };

  const checkFiles = () => {
    // List expected files for simulator
    const files = [
      '/src/pages/WishSimulator.jsx',
      '/src/services/wishSimulatorService.js',
      '/src/components/simulator/BannerSelection.jsx',
      '/src/components/simulator/SimulatorControls.jsx',
      '/src/components/simulator/SimulatorHistory.jsx',
      '/src/components/simulator/WishAnimation.jsx'
    ];
    
    // In a real environment, we'd dynamically check if these files exist
    // For now, we just report them as expected files
    return files.map(file => ({
      path: file,
      status: 'Expected file'
    }));
  };

  // Simple debug guide
  const debugTips = [
    'Check browser console for specific error messages',
    'Verify all import paths are correct in WishSimulator.jsx',
    'Make sure all referenced components exist',
    'Install missing dependencies with npm/yarn',
    'Look for syntax errors in component files',
    'Check if banners.js is properly defined and accessible',
    'Verify that getCurrentBanners() returns data properly',
    'Ensure that formatBanner() handles the banner data correctly'
  ];

  return (
    <div className="p-6 bg-black/20 rounded-lg border border-white/10">
      <h2 className="text-xl font-medium mb-4">Simulator Debug Information</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Module Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {checkModules().map((module, index) => (
              <div key={index} className="p-3 rounded-lg bg-black/20 border border-white/10">
                <div className="flex justify-between">
                  <span>{module.name}</span>
                  <span className={module.available ? 'text-green-400' : 'text-red-400'}>
                    {module.available ? 'Available' : 'Missing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Required Files</h3>
          <div className="space-y-1">
            {checkFiles().map((file, index) => (
              <div key={index} className="p-2 rounded-lg bg-black/20 border border-white/10 text-sm">
                <code className="text-white/70">{file.path}</code>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Debug Tips</h3>
          <ul className="list-disc pl-5 space-y-1">
            {debugTips.map((tip, index) => (
              <li key={index} className="text-white/70">{tip}</li>
            ))}
          </ul>
        </div>
        
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-400">
            If you continue to experience issues, try replacing the WishSimulator page with a simpler version first to isolate the problem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulatorDebug;