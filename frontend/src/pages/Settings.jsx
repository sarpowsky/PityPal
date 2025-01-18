import React from 'react';
import { Volume2, Upload, Download, Trash2, RotateCw } from 'lucide-react';

const SettingsSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-genshin text-white/80">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const SettingItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm 
                border border-white/10 group hover:bg-black/30 transition-all">
    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-medium">{label}</h3>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const [volume, setVolume] = React.useState(50);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Settings
        </h1>
      </header>

      <SettingsSection title="Sound">
        <SettingItem icon={Volume2} label="Volume">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-32"
            />
            <span className="text-sm text-white/60 min-w-[2.5rem]">
              {volume}%
            </span>
          </div>
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="Data Management">
        <SettingItem icon={Upload} label="Import Data">
          <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                         border border-white/10 text-sm transition-colors">
            Import
          </button>
        </SettingItem>
        
        <SettingItem icon={Download} label="Export Data">
          <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                         border border-white/10 text-sm transition-colors">
            Export
          </button>
        </SettingItem>

        <SettingItem icon={RotateCw} label="Check for Updates">
          <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                         border border-white/10 text-sm transition-colors">
            Check Now
          </button>
        </SettingItem>

        <SettingItem 
          icon={Trash2}
          label="Reset All Data"
        >
          <button className="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                         border border-red-500/20 text-red-400
                         text-sm transition-colors">
            Reset
          </button>
        </SettingItem>
      </SettingsSection>

      <div className="text-center text-sm text-white/40 py-4">
        Version 1.0.0
      </div>
    </div>
  );
};

export default Settings;