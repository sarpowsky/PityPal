// Path: frontend/src/utils/versionInfo.js

let cachedVersion = null;

export const getAppVersion = async () => {
  if (cachedVersion) return cachedVersion;
  
  try {
    // Try to get from API
    const result = await window.pywebview.api.get_app_version();
    if (result.success) {
      cachedVersion = result;
      return result;
    }
    
    // Fallback to hardcoded version if API fails
    return {
      version_string: "2.0.0",
      display_version: "2.0.0"
    };
  } catch (error) {
    console.error("Failed to get version info:", error);
    return {
      version_string: "2.0.0",
      display_version: "2.0.0"
    };
  }
};