// Path: frontend/src/components/reminders/RemindersList.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Trash2, Clock, AlertCircle, Star, Timer } from 'lucide-react';
import { 
  getReminders, 
  deleteReminder, 
  REMINDER_TYPES,
  formatReminderDate 
} from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

const ReminderCard = ({ reminder, onDelete, onReminderClick }) => {
  const reminderDate = new Date(reminder.date);
  const now = new Date();
  const isPast = reminderDate < now;
  const hoursLeft = Math.max(0, Math.floor((reminderDate - now) / (1000 * 60 * 60)));
  
  // Get type-specific icons and styles
  let TypeIcon = Bell;
  let reminderColor = 'indigo';
  let cardImage = null;
  
  switch (reminder.type) {
    case REMINDER_TYPES.BANNER_ENDING:
      TypeIcon = Star;
      reminderColor = 'indigo';
      cardImage = reminder.bannerData?.image;
      break;
    case REMINDER_TYPES.EVENT_ENDING:
      TypeIcon = Calendar;
      reminderColor = 'purple';
      cardImage = reminder.eventData?.image;
      break;
    case REMINDER_TYPES.SOFT_PITY:
      TypeIcon = AlertCircle;
      reminderColor = 'amber';
      break;
    case REMINDER_TYPES.RESIN_CAP:
      TypeIcon = Timer;
      reminderColor = 'blue';
      break;
    default:
      TypeIcon = Bell;
      reminderColor = 'indigo';
  }
  
  const getCardContent = () => {
    switch (reminder.type) {
      case REMINDER_TYPES.BANNER_ENDING:
        return (
          <>
            <h3 className="text-sm font-medium">{reminder.title}</h3>
            <p className="text-xs text-white/60 mt-0.5">{reminder.bannerData?.name || reminder.message}</p>
            {reminder.bannerData?.character && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
                <Star size={10} className="text-amber-400" />
                <span>{reminder.bannerData.character}</span>
              </div>
            )}
          </>
        );
      case REMINDER_TYPES.EVENT_ENDING:
        return (
          <>
            <h3 className="text-sm font-medium">{reminder.title}</h3>
            <p className="text-xs text-white/60 mt-0.5">{reminder.eventData?.name || reminder.message}</p>
            {reminder.eventData?.description && (
              <p className="text-xs text-white/40 mt-1 line-clamp-1">{reminder.eventData.description}</p>
            )}
          </>
        );
      default:
        return (
          <>
            <h3 className="text-sm font-medium">{reminder.title}</h3>
            <p className="text-xs text-white/60 mt-0.5">{reminder.message}</p>
          </>
        );
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-lg border ${isPast 
        ? 'bg-black/10 border-white/10 opacity-50' 
        : `bg-${reminderColor}-500/10 border-${reminderColor}-500/20`}
        cursor-pointer hover:bg-black/20 transition-colors`}
      onClick={() => onReminderClick && onReminderClick(reminder)}
    >
      <div className="flex items-start gap-3">
        {cardImage ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            <img 
              src={cardImage} 
              alt="Reminder" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/placeholder.png';
                e.target.classList.add('opacity-50');
              }}
            />
          </div>
        ) : (
          <div className={`p-2 rounded-lg bg-${reminderColor}-500/20 mt-0.5`}>
            <TypeIcon size={16} className={`text-${reminderColor}-400`} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {getCardContent()}
          
          <div className="flex items-center gap-2 mt-2">
            <Clock size={12} className="text-white/40" />
            <span className="text-xs text-white/60">
              {isPast 
                ? 'Past due' 
                : hoursLeft < 24 
                  ? `${hoursLeft} hours left` 
                  : formatReminderDate(reminder.date)}
            </span>
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
    // Sort by date and by type (banner/event reminders first)
    loadedReminders.sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateDiff = dateA - dateB;
      
      if (dateDiff !== 0) return dateDiff;
      
      // If dates are equal, sort by type - banner/event first
      const typeOrder = {
        [REMINDER_TYPES.BANNER_ENDING]: 1,
        [REMINDER_TYPES.EVENT_ENDING]: 2,
        [REMINDER_TYPES.SOFT_PITY]: 3,
        [REMINDER_TYPES.RESIN_CAP]: 4,
        [REMINDER_TYPES.CUSTOM]: 5
      };
      
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    setReminders(loadedReminders);
    setLoading(false);
    
    if (onUpdate) {
      onUpdate();
    }
  };
  
  const handleDeleteReminder = (id) => {
    deleteReminder(id);
    refreshReminders();
    showNotification('info', 'Reminder Deleted', 'The reminder has been removed.');
  };
  
  if (loading) {
    return (
      <div className="p-4 text-center text-white/60">
        <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent mx-auto mb-2"></div>
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
        <p className="text-xs text-white/40 mt-1">
          Create a reminder to be notified about events and banners
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