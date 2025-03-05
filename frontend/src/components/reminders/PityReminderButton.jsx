// Path: frontend/src/components/reminders/PityReminderButton.jsx
import React, { useState } from 'react';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';
import { createSoftPityReminder } from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

const PityReminderButton = ({ pity, bannerType, label = "Notify at Soft Pity" }) => {
  const [hasReminder, setHasReminder] = useState(false);
  const { showNotification } = useNotification();

  const toggleReminder = () => {
    if (hasReminder) {
      // Would normally delete reminder here
      setHasReminder(false);
      showNotification('info', 'Reminder Removed', 'Soft pity notification removed.');
      return;
    }

    try {
      const reminder = createSoftPityReminder(pity, bannerType);
      
      if (reminder) {
        setHasReminder(true);
        showNotification('success', 'Reminder Set', 
          `You'll be notified when you approach soft pity!`);
      } else {
        showNotification('info', 'No Reminder Needed', 
          'You are either too far from soft pity or already past it.');
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
      showNotification('error', 'Error', 'Failed to create reminder.');
    }
  };

  // Calculate soft pity threshold
  const softPity = bannerType.includes('weapon') ? 63 : 74;
  
  // Determine if we're close to soft pity
  const isCloseToPity = pity >= (softPity - 10) && pity < softPity;
  
  // If already at or past soft pity, don't show button
  if (pity >= softPity) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
                   bg-purple-500/10 border border-purple-500/20 text-sm">
        <AlertTriangle size={14} className="text-purple-400" />
        <span>Soft Pity Active!</span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleReminder}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
               ${hasReminder 
                 ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' 
                 : 'bg-white/5 hover:bg-white/10 border-white/10'}
               border transition-colors
               ${isCloseToPity ? 'animate-pulse' : ''}`}
    >
      {hasReminder ? (
        <>
          <BellOff size={14} />
          <span>Remove Reminder</span>
        </>
      ) : (
        <>
          <Bell size={14} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default PityReminderButton;