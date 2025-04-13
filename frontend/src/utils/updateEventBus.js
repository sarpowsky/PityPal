// Create a new file: frontend/src/utils/updateEventBus.js
// This will serve as a simple event bus to communicate between components

export const UPDATE_CHECK_REQUESTED = 'update_check_requested';
export const UPDATE_AVAILABLE = 'update_available';

class UpdateEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Create a singleton instance
const updateEventBus = new UpdateEventBus();
export default updateEventBus;