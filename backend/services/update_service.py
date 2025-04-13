# Path: backend/services/update_service.py
import requests
import logging
import json
import os
import time
import threading
import shutil
from packaging import version
from pathlib import Path
import platform
from datetime import datetime
import zipfile
import tempfile
from dotenv import load_dotenv

# Load environment variables for GitHub token
load_dotenv()

logger = logging.getLogger(__name__)

class UpdateService:
    def __init__(self, current_version="1.0.0"):
        """Initialize the update service with current version and settings."""
        self.current_version = current_version
        self.settings_file = self._get_settings_path()
        self.settings = self._load_settings()
        self._check_thread = None
        self._download_thread = None
        self._check_callback = None
        self._download_callback = None
        self._download_progress = 0
        self._is_downloading = False
        
        # Get update configuration
        config_path = Path(__file__).parent / "../.." / "update_config.json"
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.owner = config.get("owner", "sarpowsky")
                self.repo = config.get("repo", "PityPal")
        else:
            # Fallback to default
            self.owner = "sarpowsky"
            self.repo = "PityPal"
            
        self.update_url = f"https://api.github.com/repos/{self.owner}/{self.repo}/releases/latest"
        self.auto_check = self.settings.get('auto_check_updates', True)
        self.check_frequency = self.settings.get('check_frequency', 86400)  # Default: 1 day in seconds
        self.last_check_time = self.settings.get('last_check_time', 0)
        self.update_info = None
        
    def _get_settings_path(self):
        """Get the path to the settings file based on the platform."""
        if platform.system() == "Windows":
            app_data_path = Path.home() / "AppData/Local/PityPal"
        elif platform.system() == "Darwin":  # macOS
            app_data_path = Path.home() / "Library/Application Support/PityPal"
        else:  # Linux and others
            app_data_path = Path.home() / ".pitypal"
            
        app_data_path.mkdir(parents=True, exist_ok=True)
        return app_data_path / "settings.json"
    
    def _load_settings(self):
        """Load settings from file or create default settings."""
        if not self.settings_file.exists():
            default_settings = {
                'auto_check_updates': True,
                'check_frequency': 86400,  # 1 day in seconds
                'last_check_time': 0,
                'update_channel': 'stable'
            }
            self._save_settings(default_settings)
            return default_settings
        
        try:
            with open(self.settings_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            # Return default settings if loading fails
            return {'auto_check_updates': True, 'check_frequency': 86400, 'last_check_time': 0}
    
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

    def set_check_frequency(self, hours):
        """Set how often to check for updates (in hours)."""
        try:
            # Convert hours to seconds
            seconds = int(hours) * 3600
            self.check_frequency = seconds
            self.settings['check_frequency'] = seconds
            
            if self._save_settings(self.settings):
                logger.info(f"Update check frequency changed to: {hours} hours")
                return {"success": True, "check_frequency": hours}
            else:
                logger.error("Failed to save check frequency setting")
                return {"success": False, "error": "Failed to save setting"}
        except Exception as e:
            logger.error(f"Error setting check_frequency: {e}")
            return {"success": False, "error": str(e)}
    
    def check_for_updates(self, force=False, callback=None):
        """Check for newer versions of the application in a background thread.
        
        Args:
            force (bool): Force check regardless of auto_check setting
            callback (function): Optional callback for when check completes
            
        Returns:
            dict: Initial response with success status and request_id
        """
        # Skip check if auto_check is disabled and not forced
        if not self.auto_check and not force:
            return {
                "success": True,
                "skipped": True,
                "message": "Automatic updates are disabled",
                "current_version": self.current_version
            }
        
        # Only check if forced or enough time has passed since last check
        current_time = time.time()
        time_since_last_check = current_time - self.last_check_time
        
        if not force and time_since_last_check < self.check_frequency:
            logger.info(f"Skipping update check - last check was {time_since_last_check / 3600:.1f} hours ago")
            return {
                "success": True,
                "skipped": True,
                "message": "Update check performed recently",
                "current_version": self.current_version
            }
        
        self._check_callback = callback
        
        # Generate a request ID for tracking
        request_id = f"check_{int(time.time())}"
        
        # Start the check in a background thread
        self._check_thread = threading.Thread(
            target=self._check_for_updates_thread,
            args=(force, request_id),
            daemon=True
        )
        self._check_thread.start()
        
        return {
            "success": True,
            "message": "Update check started",
            "request_id": request_id,
            "current_version": self.current_version
        }
    
    def _check_for_updates_thread(self, force, request_id):
        """Background thread for checking updates."""
        result = self._perform_update_check(force)
        
        # Store result for later retrieval
        self.update_info = result
        
        # Update last check time if successful
        if result.get("success", False):
            self.last_check_time = time.time()
            self.settings['last_check_time'] = self.last_check_time
            self._save_settings(self.settings)
        
        # Call callback if provided
        if self._check_callback:
            try:
                self._check_callback(result)
            except Exception as e:
                logger.error(f"Error in update check callback: {e}")
    
    def _perform_update_check(self, force=False):
        """Perform the actual update check against GitHub."""
        try:
            # Get GitHub token from environment variables
            github_token = os.environ.get("GITHUB_TOKEN")
            
            headers = {
                "Accept": "application/vnd.github.v3+json"
            }
            
            # Add authentication if token is available
            if github_token:
                headers["Authorization"] = f"token {github_token}"
            
            response = requests.get(
                self.update_url,
                headers=headers,
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
            
            # Find the Windows asset (typically .exe or .zip)
            windows_asset = None
            for asset in data.get("assets", []):
                if asset.get("name", "").endswith((".exe", ".zip")) and "windows" in asset.get("name", "").lower():
                    windows_asset = asset
                    break
                    
            # If no Windows-specific asset found, take the first .exe or .zip
            if not windows_asset:
                for asset in data.get("assets", []):
                    if asset.get("name", "").endswith((".exe", ".zip")):
                        windows_asset = asset
                        break
            
            download_url = windows_asset.get("browser_download_url", "") if windows_asset and has_update else ""
            download_size = windows_asset.get("size", 0) if windows_asset else 0
            
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
                "download_size": download_size,
                "release_notes": data.get("body", ""),
                "release_date": data.get("published_at", ""),
                "release_id": data.get("id", "")
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
    
    def get_update_status(self):
        """Get the status of the last update check."""
        return self.update_info or {
            "success": True, 
            "update_available": False,
            "current_version": self.current_version,
            "message": "No update check performed yet"
        }
    
    def download_update(self, download_url=None, callback=None, progress_callback=None):
        """Download the update in a background thread.
        
        Args:
            download_url (str): URL to download the update from (if not provided, uses the URL from last check)
            callback (function): Callback for when download completes
            progress_callback (function): Callback for download progress updates
            
        Returns:
            dict: Initial response with success status and download_id
        """
        if self._is_downloading:
            return {
                "success": False,
                "error": "Download already in progress"
            }
        
        # If no URL provided, get it from the last update check
        if not download_url and self.update_info and self.update_info.get("update_available"):
            download_url = self.update_info.get("download_url")
        
        if not download_url:
            return {
                "success": False,
                "error": "No download URL available. Please check for updates first."
            }
        
        self._download_callback = callback
        self._progress_callback = progress_callback
        self._download_progress = 0
        self._is_downloading = True
        
        # Generate a download ID for tracking
        download_id = f"download_{int(time.time())}"
        
        # Start the download in a background thread
        self._download_thread = threading.Thread(
            target=self._download_update_thread,
            args=(download_url, download_id),
            daemon=True
        )
        self._download_thread.start()
        
        return {
            "success": True,
            "message": "Download started",
            "download_id": download_id
        }
    
    def _download_update_thread(self, download_url, download_id):
        """Background thread for downloading updates."""
        try:
            # Create downloads directory if it doesn't exist
            downloads_dir = Path.home() / "Downloads" / "PityPal"
            downloads_dir.mkdir(parents=True, exist_ok=True)
            
            # Determine file name from URL
            file_name = os.path.basename(download_url)
            download_path = downloads_dir / file_name
            
            # Download with progress
            response = requests.get(download_url, stream=True, timeout=60)
            response.raise_for_status()
            
            # Get total file size
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(download_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        progress = int(100 * downloaded / total_size) if total_size > 0 else 0
                        self._download_progress = progress
                        
                        # Call progress callback if provided
                        if self._progress_callback:
                            try:
                                self._progress_callback(progress)
                            except Exception as e:
                                logger.error(f"Error in progress callback: {e}")
            
            # If it's a zip file, extract it
            extracted_path = None
            if download_path.suffix.lower() == '.zip':
                extract_dir = downloads_dir / f"PityPal_{self.update_info.get('latest_version', 'update')}"
                extract_dir.mkdir(exist_ok=True)
                
                with zipfile.ZipFile(download_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                
                extracted_path = str(extract_dir)
            
            result = {
                "success": True,
                "message": "Download completed successfully",
                "download_id": download_id,
                "file_path": str(download_path),
                "extracted_path": extracted_path
            }
        except Exception as e:
            logger.error(f"Error downloading update: {e}")
            result = {
                "success": False,
                "error": f"Download failed: {str(e)}",
                "download_id": download_id
            }
        
        self._is_downloading = False
        
        # Call callback if provided
        if self._download_callback:
            try:
                self._download_callback(result)
            except Exception as e:
                logger.error(f"Error in download callback: {e}")
    
    def get_download_progress(self):
        """Get the current download progress."""
        return {
            "success": True,
            "is_downloading": self._is_downloading,
            "progress": self._download_progress
        }
        
    def install_update(self, file_path=None):
        """Prepare the update for installation.
        
        Args:
            file_path (str): Path to the downloaded update file
            
        Returns:
            dict: Result with success status
        """
        try:
            if not file_path:
                return {
                    "success": False,
                    "error": "No file path provided for installation"
                }
            
            file_path = Path(file_path)
            if not file_path.exists():
                return {
                    "success": False,
                    "error": f"Update file not found: {file_path}"
                }
            
            # Handle different file types
            if file_path.suffix.lower() == '.exe':
                # For .exe files, simply open them with os.startfile
                os.startfile(file_path)
                return {
                    "success": True,
                    "message": "Installer launched"
                }
            elif file_path.suffix.lower() == '.zip':
                # For zip files, we need a different approach
                return {
                    "success": True,
                    "message": "Update extracted, please run the installer manually",
                    "file_path": str(file_path)
                }
            else:
                return {
                    "success": False,
                    "error": f"Unsupported update file type: {file_path.suffix}"
                }
                
        except Exception as e:
            logger.error(f"Error installing update: {e}")
            return {
                "success": False,
                "error": f"Installation failed: {str(e)}"
            }