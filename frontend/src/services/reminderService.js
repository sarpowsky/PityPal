// Path: frontend/src/services/reminderService.js

/**
 * Service for managing banner and pity reminders
 */

// Constants for reminder types
export const REMINDER_TYPES = {
    BANNER_ENDING: 'banner-ending',
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
  const loadReminders = () => {
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
        weapons: banner.weapons || null
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