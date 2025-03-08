// Path: frontend/src/components/reminders/RemindersButton.jsx
import React, { useState, useEffect } from 'react';
import { BellRing, Bell, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getDueReminders, 
  getReminders, 
  REMINDER_TYPES 
} from '../../services/reminderService';
import RemindersList from './RemindersList';
import ReminderDialog from './ReminderDialog';

const RemindersButton = () => {
  const [showReminders, setShowReminders] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  
  // Check for reminders periodically
  useEffect(() => {
    const checkReminders = () => {
      const allReminders = getReminders();
      const dueReminders = getDueReminders(24); // Due in next 24 hours
      
      setReminderCount(allReminders.length);
      setDueCount(dueReminders.length);
    };
    
    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const toggleReminders = () => {
    if (showCreateDialog) {
      setShowCreateDialog(false);
    }
    setShowReminders(!showReminders);
  };
  
  const handleCreateClick = (e) => {
    e.stopPropagation();
    setShowCreateDialog(true);
    setShowReminders(false);
  };
  
  const updateReminderCounts = () => {
    const allReminders = getReminders();
    const dueReminders = getDueReminders(24);
    
    setReminderCount(allReminders.length);
    setDueCount(dueReminders.length);
  };
  
  return (
    <div className="relative">
      {/* Bell button with badge indicator */}
      <button
        onClick={toggleReminders}
        className="relative p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30
                 border border-indigo-500/30 text-indigo-400 transition-colors"
      >
        <BellRing size={20} />
        
        {/* Notification badge */}
        {dueCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 
                        flex items-center justify-center text-[10px] font-medium animate-pulse">
            {dueCount}
          </div>
        )}
      </button>
      
      {/* Reminders panel */}
      <AnimatePresence>
        {showReminders && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 z-50"
          >
            <div className="rounded-xl bg-gray-900/95 border border-white/10 shadow-xl
                          backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <h3 className="font-medium">Reminders</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCreateClick}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors
                             flex items-center gap-1 text-xs"
                  >
                    <Plus size={14} />
                    <span>New</span>
                  </button>
                  <button
                    onClick={() => setShowReminders(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto p-3">
                <RemindersList
                  onReminderClick={() => setShowReminders(false)}
                  onUpdate={updateReminderCounts}
                />
              </div>
              
              {reminderCount > 0 && (
                <div className="p-2 border-t border-white/10 bg-black/20 text-xs text-center text-white/60">
                  {reminderCount} active reminder{reminderCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Create reminder dialog */}
      {showCreateDialog && (
        <ReminderDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={() => {
            setShowCreateDialog(false);
            setShowReminders(true);
            updateReminderCounts();
          }}
        />
      )}
    </div>
  );
};

export default RemindersButton;