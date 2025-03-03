# Path: backend/services/update_service.py
import requests
import logging
from packaging import version

logger = logging.getLogger(__name__)

class UpdateService:
    def __init__(self, current_version="1.0.0"):
        self.current_version = current_version
        self.update_url = "https://api.github.com/repos/yourusername/GenshinWishTracker/releases/latest"
        
    def check_for_updates(self):
        """Check for newer versions of the application"""
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
            
            return {
                "success": True,
                "current_version": self.current_version,
                "latest_version": latest_version,
                "update_available": has_update,
                "download_url": download_url,
                "release_notes": data.get("body", "")
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