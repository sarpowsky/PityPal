// Path: frontend/src/components/reminders/ReminderDialog.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Clock, Calendar, Info, Loader } from 'lucide-react';
import BannerEventSelector from './BannerEventSelector';
import { 
  createBannerEndingReminder, 
  createEventEndingReminder,
  createCustomReminder
} from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

// Creates and manages reminder notifications for banner endings, events, and custom timepoints
// Supports selecting active banners and events with customizable notification timing
// Persists reminder data to localStorage for cross-session availability

const ReminderTypeSelector = ({ selected, onChange }) => {
  const types = [
    { id: 'banner', label: 'Banner' },
    { id: 'event', label: 'Event' },
    { id: 'custom', label: 'Custom' }
  ];
  
  return (
    <div className="flex items-center gap-2">
      {types.map(type => (
        <button
          key={type.id}
          className={`px-4 py-2 rounded-lg text-sm transition-colors
                   ${selected === type.id 
                     ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                     : 'bg-black/20 border-white/10 text-white/60 hover:bg-black/30'}
                   border`}
          onClick={() => onChange(type.id)}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

const ReminderDialog = ({ onClose, onCreated }) => {
  const [reminderType, setReminderType] = useState('banner');
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hours, setHours] = useState(24);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { showNotification } = useNotification();
  
  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for input fields
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const defaultTime = '12:00';
    
    setDate(defaultDate);
    setTime(defaultTime);
  }, []);
  
  const handleCreateReminder = async () => {
    try {
      setIsCreating(true);
      let reminder = null;
      
      if (reminderType === 'banner') {
        if (!selectedBanner) {
          showNotification('error', 'Missing Information', 'Please select a banner');
          setIsCreating(false);
          return;
        }
        
        reminder = createBannerEndingReminder(selectedBanner, hours);
        
        if (reminder) {
          showNotification('success', 'Reminder Created', 
            `You'll be notified when "${selectedBanner.name}" is about to end!`);
        } else {
          showNotification('error', 'Cannot Create Reminder', 
            'Unable to create reminder for this banner (may be permanent or already ended).');
          setIsCreating(false);
          return;
        }
      } 
      else if (reminderType === 'event') {
        if (!selectedEvent) {
          showNotification('error', 'Missing Information', 'Please select an event');
          setIsCreating(false);
          return;
        }
        
        reminder = createEventEndingReminder(selectedEvent, hours);
        
        if (reminder) {
          showNotification('success', 'Reminder Created', 
            `You'll be notified when "${selectedEvent.name}" is about to end!`);
        } else {
          showNotification('error', 'Cannot Create Reminder', 
            'Unable to create reminder for this event (may be already ended).');
          setIsCreating(false);
          return;
        }
      }
      else if (reminderType === 'custom') {
        if (!title || !message || !date || !time) {
          showNotification('error', 'Missing Information', 'Please fill out all fields');
          setIsCreating(false);
          return;
        }
        
        // Combine date and time strings into a Date object
        const reminderDateTime = new Date(`${date}T${time}`);
        
        // Ensure the date is in the future
        if (reminderDateTime <= new Date()) {
          showNotification('error', 'Invalid Date', 'Reminder date must be in the future');
          setIsCreating(false);
          return;
        }
        
        reminder = createCustomReminder(title, message, reminderDateTime);
        
        if (reminder) {
          showNotification('success', 'Reminder Created', 'Your custom reminder has been set');
        } else {
          showNotification('error', 'Cannot Create Reminder', 'Failed to create reminder');
          setIsCreating(false);
          return;
        }
      }
      
      if (onCreated) {
        onCreated(reminder);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to create reminder:', error);
      showNotification('error', 'Error', 'Failed to create reminder');
      setIsCreating(false);
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
            <h2 className="text-lg font-medium">Create Reminder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            disabled={isCreating}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="space-y-4">
            {/* Reminder Type Selector */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Reminder Type
              </label>
              <ReminderTypeSelector 
                selected={reminderType} 
                onChange={setReminderType} 
              />
            </div>
            
            {/* Banner/Event Selector */}
            {(reminderType === 'banner' || reminderType === 'event') && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {reminderType === 'banner' ? 'Select Banner' : 'Select Event'}
                </label>
                <BannerEventSelector
                  showBanners={reminderType === 'banner'}
                  showEvents={reminderType === 'event'}
                  selectedBanner={selectedBanner}
                  selectedEvent={selectedEvent}
                  onBannerSelect={setSelectedBanner}
                  onEventSelect={setSelectedEvent}
                />
              </div>
            )}
            
            {/* Custom Reminder Fields */}
            {reminderType === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Reminder title"
                    className="w-full px-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                             border border-white/10 text-white focus:outline-none
                             focus:border-indigo-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Reminder message"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                             border border-white/10 text-white focus:outline-none
                             focus:border-indigo-500/50 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                                 border border-white/10 text-white focus:outline-none
                                 focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Time
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                                 border border-white/10 text-white focus:outline-none
                                 focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Hours Before End (for banner/event) */}
            {(reminderType === 'banner' || reminderType === 'event') && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Notify me before
                </label>
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
            )}
          </div>
          
          {/* Info message */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 mt-4">
            <Info size={16} className="text-indigo-400" />
            <span className="text-xs text-white/60">
              {reminderType === 'banner' 
                ? 'You will be notified before the banner ends'
                : reminderType === 'event'
                  ? 'You will be notified before the event ends'
                  : 'Set a custom reminder for anything you need to remember'}
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10
                       border border-white/10 text-sm transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateReminder}
              className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30
                       border border-indigo-500/30 text-sm text-indigo-400
                       transition-colors flex items-center gap-2"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Bell size={16} />
                  <span>Create Reminder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReminderDialog;