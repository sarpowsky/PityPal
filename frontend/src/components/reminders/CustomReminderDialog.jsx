// Path: frontend/src/components/reminders/CustomReminderDialog.jsx
import React, { useState } from 'react';
import { X, Bell, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { createCustomReminder } from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';

const CustomReminderDialog = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { showNotification } = useNotification();
  
  // Set default date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for input fields
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const defaultTime = '12:00';
    
    setDate(defaultDate);
    setTime(defaultTime);
  }, []);
  
  const handleCreateReminder = () => {
    if (!title || !message || !date || !time) {
      showNotification('error', 'Missing Information', 'Please fill out all fields.');
      return;
    }

    try {
      // Combine date and time strings into a Date object
      const reminderDateTime = new Date(`${date}T${time}`);
      
      // Ensure the date is in the future
      if (reminderDateTime <= new Date()) {
        showNotification('error', 'Invalid Date', 'Reminder date must be in the future.');
        return;
      }
      
      // Create the reminder
      const reminder = createCustomReminder(title, message, reminderDateTime);
      
      if (reminder) {
        showNotification('success', 'Reminder Created', 'Your custom reminder has been set.');
        onClose();
      } else {
        showNotification('error', 'Could Not Create Reminder', 'Failed to create reminder.');
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
            <h2 className="text-lg font-medium">Create Custom Reminder</h2>
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
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reminder title"
                className="w-full px-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                         border border-white/10 text-white focus:outline-none
                         focus:border-indigo-500/50"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-1">
                Message
              </label>
              <textarea
                id="message"
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
                <label htmlFor="date" className="block text-sm font-medium text-white/80 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                             border border-white/10 text-white focus:outline-none
                             focus:border-indigo-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-white/80 mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/20 backdrop-blur-sm
                             border border-white/10 text-white focus:outline-none
                             focus:border-indigo-500/50"
                  />
                </div>
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
              <span>Create Reminder</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomReminderDialog;