// Path: frontend/src/utils/reminderUtils.js
import { format, formatDistance, formatRelative, differenceInHours } from 'date-fns';

/**
 * Format a reminder date for display
 */
export const formatReminderDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // For dates in the future
  if (date > now) {
    // If it's within 24 hours
    if (differenceInHours(date, now) < 24) {
      return formatDistance(date, now, { addSuffix: true });
    }
    
    // If it's within the next week
    if (differenceInHours(date, now) < 168) { // 7 days * 24 hours
      return formatRelative(date, now);
    }
    
    // For dates further in the future
    return format(date, 'PPP'); // Jan 1, 2022
  }
  
  // For dates in the past
  return formatDistance(date, now, { addSuffix: true });
};

/**
 * Get the number of hours until a reminder is due
 */
export const getHoursUntilDue = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Only calculate for future dates
  if (date <= now) return 0;
  
  return differenceInHours(date, now);
};

/**
 * Check if a reminder is soon (within the specified hours)
 */
export const isReminderSoon = (dateString, hoursThreshold = 24) => {
  const hoursLeft = getHoursUntilDue(dateString);
  return hoursLeft > 0 && hoursLeft <= hoursThreshold;
};

/**
 * Get a human-readable time string for a reminder
 */
export const getReminderTimeString = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const hoursLeft = getHoursUntilDue(dateString);
  
  // If already past
  if (date < now) {
    return 'Past due';
  }
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  // If tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }
  
  // If within a week
  if (hoursLeft <= 168) { // 7 days * 24 hours
    return format(date, 'EEEE') + ` at ${format(date, 'h:mm a')}`;
  }
  
  // Otherwise
  return format(date, 'PP') + ` at ${format(date, 'h:mm a')}`;
};