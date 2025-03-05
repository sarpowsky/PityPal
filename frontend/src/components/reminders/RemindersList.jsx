// Path: frontend/src/components/reminders/RemindersList.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Trash2, Clock, AlertCircle } from 'lucide-react';
import { getReminders, deleteReminder, REMINDER_TYPES } from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

const ReminderCard = ({ reminder, onDelete, onReminderClick }) => {
  const reminderDate = new Date(reminder.date);
  const now = new Date();
  const isPast = reminderDate < now;
  const hoursLeft = Math.max(0, Math.floor((reminderDate - now) / (1000 * 60 * 60)));
  
  // Get type-specific icons and styles
  let TypeIcon = Bell;
  let reminderColor = 'indigo';
  
  switch (reminder.type) {
    case REMINDER_TYPES.BANNER_ENDING:
      TypeIcon = Calendar;
      reminderColor = 'indigo';
      break;
    case REMINDER_TYPES.SOFT_PITY:
      TypeIcon = AlertCircle;
      reminderColor = 'purple';
      break;
    case REMINDER_TYPES.RESIN_CAP:
      TypeIcon = Clock;
      reminderColor = 'blue';
      break;
    default:
      TypeIcon = Bell;
      reminderColor = 'indigo';
  }
  
  return (
    <div 
      className={`p-3 rounded-lg border ${isPast 
        ? 'bg-black/10 border-white/10 opacity-50' 
        : `bg-${reminderColor}-500/10 border-${reminderColor}-500/20`}
        cursor-pointer hover:bg-black/20 transition-colors`}
      onClick={() => onReminderClick && onReminderClick(reminder)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div className={`p-2 rounded-lg bg-${reminderColor}-500/20 mt-0.5`}>
            <TypeIcon size={16} className={`text-${reminderColor}-400`} />
          </div>
          <div>
            <h3 className="text-sm font-medium">{reminder.title}</h3>
            <p className="text-xs text-white/60 mt-0.5">{reminder.message}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <Clock size={12} className="text-white/40" />
              <span className="text-xs text-white/60">
                {isPast 
                  ? 'Past due' 
                  : hoursLeft < 24 
                    ? `${hoursLeft} hours left` 
                    : reminderDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(reminder.id);
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Trash2 size={14} className="text-white/40" />
        </button>
      </div>
    </div>
  );
};

const RemindersList = ({ onReminderClick, onUpdate }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Load reminders
  useEffect(() => {
    refreshReminders();
  }, []);
  
  const refreshReminders = () => {
    setLoading(true);
    const loadedReminders = getReminders();
    // Sort by date
    loadedReminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    setReminders(loadedReminders);
    setLoading(false);
    
    if (onUpdate) {
      onUpdate();
    }
  };
  
  const handleDeleteReminder = (id) => {
    deleteReminder(id);
    refreshReminders();
    showNotification('info', 'Reminder Deleted', 'The reminder has been deleted.');
  };
  
  if (loading) {
    return (
      <div className="p-4 text-center text-white/60">
        <p>Loading reminders...</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="p-4 text-center">
        <Bell size={24} className="mx-auto mb-2 text-white/40" />
        <p className="text-sm text-white/60">
          No active reminders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map(reminder => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onDelete={handleDeleteReminder}
          onReminderClick={onReminderClick}
        />
      ))}
    </div>
  );
};

export default RemindersList;