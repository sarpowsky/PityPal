/* Path: frontend/src/components/ImportGuideModal.jsx */
import React from 'react';
import { X, ExternalLink, Copy, Info } from 'lucide-react';

const ImportGuideModal = ({ onClose }) => {
  const copyUrl = () => {
    navigator.clipboard.writeText('https://webstatic-sea.hoyoverse.com/genshin/event/e20190909gacha/');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] 
                  flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900/95 to-black/95 
                    rounded-2xl border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-genshin">How to Import Wishes</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Important Note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Important Note</h3>
              <p className="text-sm text-white/70">
                Your wish history URL is temporary and expires after a short time. You'll need to obtain a new URL whenever you want to update your wish history.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Open Game and History</h3>
              <p className="text-sm text-white/70">
                Launch Genshin Impact and open the wish history page by clicking History in any banner.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">2. Open Web History</h3>
              <p className="text-sm text-white/70">
                Click on the option that opens the history in your web browser.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">3. Copy URL</h3>
              <p className="text-sm text-white/70">
                Copy the URL from your browser's address bar once the page loads.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-sm text-white/40 truncate">
                  https://webstatic-sea.hoyoverse.com/genshin/event/e20190909gacha/
                </div>
                <button 
                  onClick={copyUrl}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
                           border border-white/10 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">4. Import to App</h3>
              <p className="text-sm text-white/70">
                Paste the URL into the import field at the top of the home page and click Import.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <a 
              href="https://docs.genshinwizard.com/wishing-centre/history-link" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 
                       hover:text-indigo-300 transition-colors"
            >
              <ExternalLink size={16} />
              <span>Detailed guide in wiki</span>
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