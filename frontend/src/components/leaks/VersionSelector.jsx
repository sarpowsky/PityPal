// Path: src/components/leaks/VersionSelector.jsx
import ReactDOM from 'react-dom';
import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const VersionSelector = ({ versions, selectedVersion, onSelectVersion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRef = useRef(null);
  
  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };
  
  const handleVersionClick = (version) => {
    onSelectVersion(version);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 rounded-lg 
                bg-black/30 backdrop-blur-sm border border-white/10
                hover:bg-black/40 transition-colors"
      >
        <span>Version {selectedVersion.version}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && buttonRect && ReactDOM.createPortal(
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl overflow-hidden w-56"
          style={{
            top: `${buttonRect.bottom + window.scrollY}px`,
            left: `${buttonRect.left + window.scrollX}px`,
            zIndex: 99999
          }}
        >
          <div className="max-h-48 overflow-y-auto">
            {versions.map((version) => (
              <button
                key={version.version}
                onClick={() => handleVersionClick(version)}
                className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors
                          ${selectedVersion.version === version.version ? 'bg-white/10' : ''}`}
              >
                <div className="flex items-center gap-1">
                  <span>Version {version.version}</span>
                  {version.title && (
                    <span className="text-white/60 text-sm">• {version.title}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VersionSelector;