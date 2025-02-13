// Path: frontend/src/components/ImportGuideModal.jsx
import React, { useState } from 'react';
import { X, ExternalLink, Copy, Info, Terminal } from 'lucide-react';

const ImportGuideModal = ({ onClose }) => {
  const [copySuccess, setCopySuccess] = useState('');
  
  const powershellCommand = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/sarpowsky/WishHistoryLinkGrabber/refs/heads/main/historykey.ps1'))} global"`;

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(powershellCommand);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] 
                  flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-gray-900/95 to-black/95 
                    rounded-2xl border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-genshin">How to Import Wishes</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Important Note and Steps 1-3 */}
            <div className="col-span-4 space-y-3">      
              {/* Steps 1-3 */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium mb-1">1. Open Genshin Impact</h3>
                  <p className="text-xs text-white/70">Launch Genshin Impact on your PC.</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">2. Access Wish History</h3>
                  <p className="text-xs text-white/70">Go to the Wish History page and wait for it to load completely.</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">3. Minimize Game</h3>
                  <p className="text-xs text-white/70">Minimize the game and go back to Windows.</p>
                </div>
              </div>
            </div>

            {/* Middle Column - Steps 4-5 with PowerShell Command */}
            <div className="col-span-5 space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-1">4. Open PowerShell</h3>
                <p className="text-xs text-white/70">
                  Open the Start menu, search for PowerShell, and open Windows PowerShell.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-1">5. Execute Command</h3>
                <p className="text-xs text-white/70">
                  Copy and paste the following command into PowerShell:
                </p>
                <div className="relative">
                  <div className="relative p-3 rounded-lg bg-black/40 border border-white/10">
                    <div className="absolute left-2 top-2">
                      <button 
                        onClick={copyCommand}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 
                                 border border-white/10 transition-colors group"
                      >
                        <Copy size={14} className="text-white/40 group-hover:text-white/60" />
                      </button>
                    </div>
                    <div className="pt-8">
                      <code className="text-xs text-white/70 font-mono break-all">
                        {powershellCommand}
                      </code>
                    </div>
                  </div>
                  {copySuccess && (
                    <div className="absolute right-2 top-0 px-2 py-1 text-xs text-white/60 
                                 bg-white/10 rounded-md -translate-y-full mb-2">
                      {copySuccess}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Steps 6-7 */}
            <div className="col-span-3 space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-1">6. Execute Command</h3>
                <p className="text-xs text-white/70">
                  Press ENTER to execute the command. The wish history link will be automatically copied to your clipboard.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">7. Import URL</h3>
                <p className="text-xs text-white/70">
                  Paste the copied link into the URL field above.
                </p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="flex items-center gap-3 p-3 mt-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Info size={20} className="text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Important Note</h3>
              <p className="text-sm text-white/70">
                Your wish history URL is temporary and expires after a short time. You'll need to obtain a new URL whenever you want to update your wish history.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <a 
              href="https://github.com/sarpowsky/WishHistoryLinkGrabber"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 
                       hover:text-indigo-300 transition-colors"
            >
              <ExternalLink size={16} />
              <span>View on Github</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                       border border-white/10 text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportGuideModal;