// Path: src/components/leaks/utils/leaksUtils.js

/**
 * Get all items of a specific type from all phases
 * @param {Object} selectedVersion - The selected version object
 * @param {string} type - The type of items to extract (e.g., 'characters', 'banners')
 * @returns {Array} - Array of items with phase information
 */
export const getAllItemsFromPhases = (selectedVersion, type) => {
    if (!selectedVersion) {
      console.error("No selected version");
      return [];
    }
    
    if (!selectedVersion.phases || !Array.isArray(selectedVersion.phases)) {
      console.error("Selected version has no phases array:", selectedVersion);
      return [];
    }
    
    return selectedVersion.phases.flatMap(phase => {
      if (!phase || !phase[type]) return [];
      return phase[type].map((item, idx) => ({
        ...item,
        phaseNumber: phase.number,
        phaseIdx: idx
      }));
    });
  };
  
  /**
   * Format Firebase leaks data to a consistent structure
   * @param {Object} data - Raw leaks data from Firebase
   * @returns {Object} - Formatted data with versions array
   */
  export const formatLeaksData = (data) => {
    if (!data) return { versions: [] };
    
    // Handle old format (single version) vs new format (versions array)
    if (data.versions) {
      // New format - already has versions array
      return data;
    } else if (data.version) {
      // Old format - convert to new format
      return {
        versions: [{
          version: data.version,
          lastUpdated: data.lastUpdated,
          phases: data.phases || [],
          // Add empty arrays for other sections if they don't exist
          events: data.events || [],
          mapUpdates: data.mapUpdates || [],
          bosses: data.bosses || [],
          quests: data.quests || [],
          calendar: data.calendar || null
        }]
      };
    }
    
    // Invalid data format
    console.error('Invalid leaks data format:', data);
    return { versions: [] };
  };