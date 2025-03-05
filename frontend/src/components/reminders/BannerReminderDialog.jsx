// Path: frontend/src/components/reminders/BannerReminderDialog.jsx
import React, { useState } from 'react';
import { Clock, X, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { createBannerEndingReminder } from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

const BannerReminderDialog = ({ banner, onClose }) => {
  const [hours, setHours] = useState(24);
  const { showNotification } = useNotification();

  const handleCreateReminder = () => {
    try {
      const reminder = createBannerEndingReminder(banner, hours);
      
      if (reminder) {
        showNotification('success', 'Reminder Created', 
          `You'll be notified when "${banner.name}" is about to end!`);
        onClose();
      } else {
        showNotification('error', 'Cannot Create Reminder', 
          'Unable to create reminder for this banner (may be permanent or already ended).');
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
      showNotification('error', 'Error', 'Failed to create reminder.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/95 rounded-xl border border-white/10 shadow-xl 
                 max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-indigo-400" />
            <h2 className="text-lg font-medium">Set Banner Reminder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/80 mb-1">Banner</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="w-12 h-12 rounded-lg overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{banner.name}</p>
                <p className="text-sm text-white/60">
                  {new Date(banner.endDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white/80 mb-1">Notify me before</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="72"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                          bg-black/20 border border-white/10 min-w-[80px] text-center">
                <Clock size={14} className="text-white/60" />
                <span>{hours} hours</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10
                       border border-white/10 text-sm transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateReminder}
              className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30
                       border border-indigo-500/30 text-sm text-indigo-400
                       transition-colors flex items-center gap-2"
            >
              <Bell size={16} />
              <span>Set Reminder</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BannerReminderDialog;