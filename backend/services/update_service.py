# Path: backend/services/update_service.py
import requests
import logging
import json
import os
from packaging import version
from pathlib import Path
import platform

logger = logging.getLogger(__name__)

class UpdateService:
    def __init__(self, current_version="1.0.0"):
        """Initialize the update service with current version and settings."""
        self.current_version = current_version
        self.settings_file = self._get_settings_path()
        self.settings = self._load_settings()
        self.update_url = "https://api.github.com/repos/yourusername/GenshinWishTracker/releases/latest"
        self.auto_check = self.settings.get('auto_check_updates', True)
        
    def _get_settings_path(self):
        """Get the path to the settings file based on the platform."""
        if platform.system() == "Windows":
            app_data_path = Path.home() / "AppData/Local/GenshinWishTracker"
        elif platform.system() == "Darwin":  # macOS
            app_data_path = Path.home() / "Library/Application Support/GenshinWishTracker"
        else:  # Linux and others
            app_data_path = Path.home() / ".genshinwishtracker"
            
        app_data_path.mkdir(parents=True, exist_ok=True)
        return app_data_path / "settings.json"
    
    def _load_settings(self):
        """Load settings from file or create default settings."""
        if not self.settings_file.exists():
            default_settings = {
                'auto_check_updates': True
            }
            self._save_settings(default_settings)
            return default_settings
        
        try:
            with open(self.settings_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            # Return default settings if loading fails
            return {'auto_check_updates': True}
    
    def _save_settings(self, settings):
        """Save settings to file."""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            return False
    
    def get_auto_check(self):
        """Get the current auto update check setting."""
        return {"success": True, "auto_check": self.auto_check}
        
    def set_auto_check(self, enabled):
        """Enable or disable automatic update checks."""
        try:
            # Update the instance variable
            self.auto_check = bool(enabled)
            
            # Update settings dictionary
            self.settings['auto_check_updates'] = self.auto_check
            
            # Save to file
            if self._save_settings(self.settings):
                logger.info(f"Auto update setting changed to: {self.auto_check}")
                return {"success": True, "auto_check": self.auto_check}
            else:
                logger.error("Failed to save auto update setting")
                return {"success": False, "error": "Failed to save setting"}
        except Exception as e:
            logger.error(f"Error setting auto_check: {e}")
            return {"success": False, "error": str(e)}
        
    def check_for_updates(self, force=False):
        """Check for newer versions of the application.
        
        Args:
            force (bool): Force check regardless of auto_check setting
            
        Returns:
            dict: Update status including success, versions, and download info
        """
        # Skip check if auto_check is disabled and not forced
        if not self.auto_check and not force:
            return {
                "success": True,
                "skipped": True,
                "message": "Automatic updates are disabled",
                "current_version": self.current_version
            }
            
        try:
            response = requests.get(
                self.update_url,
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to check for updates: {response.status_code}")
                return {
                    "success": False,
                    "error": f"Server returned status code {response.status_code}"
                }
                
            data = response.json()
            latest_version = data.get("tag_name", "").lstrip("v")
            
            if not latest_version:
                return {
                    "success": False,
                    "error": "Could not parse version from response"
                }
            
            has_update = version.parse(latest_version) > version.parse(self.current_version)
            download_url = data.get("assets", [{}])[0].get("browser_download_url", "") if has_update else ""
            
            if not has_update:
                # App is already up to date
                return {
                    "success": True,
                    "update_available": False,
                    "current_version": self.current_version,
                    "latest_version": latest_version,
                    "message": "Application is up to date"
                }
            
            return {
                "success": True,
                "current_version": self.current_version,
                "latest_version": latest_version,
                "update_available": True,
                "download_url": download_url,
                "release_notes": data.get("body", "")
            }
            
        except requests.exceptions.ConnectionError:
            logger.error("Connection error while checking for updates")
            return {
                "success": False,
                "error": "Connection error. Please check your internet connection."
            }
        except requests.RequestException as e:
            logger.error(f"Network error checking for updates: {e}")
            return {
                "success": False,
                "error": f"Network error: {e}"
            }
        except Exception as e:
            logger.error(f"Error checking for updates: {e}")
            return {
                "success": False,
                "error": f"Error: {e}"
            }