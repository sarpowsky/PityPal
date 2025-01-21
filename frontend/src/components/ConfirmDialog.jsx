// Path: frontend/src/components/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  isDestructive = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] 
                  flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900/95 to-black/95 
                    rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle size={24} className={isDestructive ? 'text-red-400' : 'text-amber-400'} />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">{title}</h3>
              <p className="text-white/60">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-black/20">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10
                     border border-white/10 text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm transition-colors
                     ${isDestructive 
                       ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                       : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;