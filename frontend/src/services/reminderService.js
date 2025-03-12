// Path: frontend/src/services/reminderService.js
import { getCurrentBanners } from '../data/banners';
import { getCurrentEvents } from '../data/events';
import { getRemainingTime } from '../data/banners';

// Manages notification reminders for time-sensitive game events
// Handles different reminder types (banner end, event end, resin cap, etc.)
// Provides utility functions for formatting and displaying time remaining

// Constants for reminder types
export const REMINDER_TYPES = {
  BANNER_ENDING: 'banner-ending',
  EVENT_ENDING: 'event-ending',
  SOFT_PITY: 'soft-pity',
  RESIN_CAP: 'resin-cap',
  CUSTOM: 'custom'
};

// Helper function for persisting reminders to localStorage
const saveReminders = (reminders) => {
  try {
    localStorage.setItem('genshin_reminders', JSON.stringify(reminders));
  } catch (error) {
    console.error('Failed to save reminders:', error);
  }
};

// Helper function for loading reminders from localStorage
export const loadReminders = () => {
  try {
    const stored = localStorage.getItem('genshin_reminders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load reminders:', error);
    return [];
  }
};

// Create a new reminder
export const createReminder = (reminder) => {
  // Load existing reminders
  const reminders = loadReminders();
  
  // Add the new reminder with a unique ID
  const newReminder = {
    ...reminder,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  // Add to the list and save
  reminders.push(newReminder);
  saveReminders(reminders);
  
  return newReminder;
};

// Get all active reminders
export const getReminders = () => {
  // Load reminders
  const reminders = loadReminders();
  
  // Filter out expired reminders
  const now = new Date();
  const activeReminders = reminders.filter(reminder => {
    const reminderDate = new Date(reminder.date);
    return reminderDate > now;
  });
  
  // If we filtered some out, save the updated list
  if (reminders.length !== activeReminders.length) {
    saveReminders(activeReminders);
  }
  
  return activeReminders;
};

// Get only reminders due within the specified hours
export const getDueReminders = (hoursThreshold = 24) => {
  const reminders = getReminders();
  const now = new Date();
  const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);
  
  return reminders.filter(reminder => {
    const reminderDate = new Date(reminder.date);
    return reminderDate <= threshold;
  });
};

// Delete a reminder by ID
export const deleteReminder = (id) => {
  const reminders = loadReminders();
  const updatedReminders = reminders.filter(r => r.id !== id);
  saveReminders(updatedReminders);
  return updatedReminders;
};

// Update an existing reminder
export const updateReminder = (id, updates) => {
  const reminders = loadReminders();
  const updatedReminders = reminders.map(reminder => 
    reminder.id === id ? { ...reminder, ...updates } : reminder
  );
  saveReminders(updatedReminders);
  return updatedReminders;
};

// Create a banner ending reminder
export const createBannerEndingReminder = (banner, hoursBeforeEnd = 24) => {
  // Don't create reminders for permanent banners
  if (banner.isPermanent) return null;
  
  const endDate = new Date(banner.endDate);
  const reminderDate = new Date(endDate.getTime() - (hoursBeforeEnd * 60 * 60 * 1000));
  
  // Don't create reminders for past dates
  if (reminderDate <= new Date()) return null;
  
  return createReminder({
    type: REMINDER_TYPES.BANNER_ENDING,
    title: 'Banner Ending Soon',
    message: `${banner.name} is ending in ${hoursBeforeEnd} hours!`,
    date: reminderDate.toISOString(),
    bannerData: {
      id: banner.id,
      name: banner.name,
      endDate: banner.endDate,
      character: banner.character || null,
      weapons: banner.weapons || null,
      image: banner.image || null
    }
  });
};

// Create an event ending reminder
export const createEventEndingReminder = (event, hoursBeforeEnd = 24) => {
  const endDate = new Date(event.endDate);
  const reminderDate = new Date(endDate.getTime() - (hoursBeforeEnd * 60 * 60 * 1000));
  
  // Don't create reminders for past dates
  if (reminderDate <= new Date()) return null;
  
  return createReminder({
    type: REMINDER_TYPES.EVENT_ENDING,
    title: 'Event Ending Soon',
    message: `${event.name} is ending in ${hoursBeforeEnd} hours!`,
    date: reminderDate.toISOString(),
    eventData: {
      id: event.id,
      name: event.name,
      description: event.description,
      endDate: event.endDate,
      image: event.image || null
    }
  });
};

// Create a soft pity reminder
export const createSoftPityReminder = (currentPity, bannerType, threshold = 5) => {
  // Get the soft pity threshold for this banner type
  const softPity = bannerType.includes('weapon') ? 63 : 74;
  
  // If not close enough to soft pity, don't create a reminder
  if (currentPity < softPity - threshold) return null;
  
  // Create the reminder for right now (immediate notification)
  return createReminder({
    type: REMINDER_TYPES.SOFT_PITY,
    title: 'Approaching Soft Pity',
    message: `You're at pity ${currentPity}, only ${softPity - currentPity} pulls away from soft pity!`,
    date: new Date().toISOString(),
    pityData: {
      currentPity,
      softPity,
      bannerType
    }
  });
};

// Create a custom reminder
export const createCustomReminder = (title, message, date) => {
  return createReminder({
    type: REMINDER_TYPES.CUSTOM,
    title,
    message,
    date: new Date(date).toISOString()
  });
};

// Format a reminder date for display
export const formatReminderDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // For dates in the future
  if (date > now) {
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's within the next week
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    if (date < nextWeek) {
      return date.toLocaleDateString([], { weekday: 'long' }) + 
        ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { 
      month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }
  
  // For dates in the past
  return 'Past due';
};

// Get all active banners for reminder selection
export const getActiveBannersForReminders = () => {
  return getCurrentBanners().filter(banner => !banner.isPermanent);
};

// Get all active events for reminder selection
export const getActiveEventsForReminders = () => {
  return getCurrentEvents();
};

// Helper to get time remaining until banner/event end
export const getTimeRemainingForItem = (endDate) => {
  if (!endDate) return null;
  return getRemainingTime(endDate);
};