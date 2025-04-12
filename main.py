# Path: main.py

import webview
import json
import os
import sys
import logging
import threading
from pathlib import Path
from backend.services.wish_service import WishService
from backend.services.pity_calculator import PityCalculator
from backend.services.data_service import DataService
from backend.services.update_service import UpdateService
from backend.services.pity_predictor.model_trainer_service import ModelTrainerService
from backend.services.pity_predictor.predictor_service import PredictorService
from backend.services.firebase_service import firebase_service, initialize_firebase
# Import the base model creator
from backend.services.pity_predictor.create_base_model import create_base_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class API:
    def __init__(self):
        self.wish_service = WishService()
        self.pity_calculator = PityCalculator()
        self.data_service = DataService()
        self.predictor_service = PredictorService()
        self.model_trainer_service = ModelTrainerService()
        self.update_service = UpdateService(current_version="1.0.0")
        logger.info("API services initialized")
        
    def import_wishes(self, url, progress_callback=None):
        try:
            result = self.wish_service.import_from_url(url)
            if result["success"]:
                result["data"] = self.pity_calculator.calculate_pull_counts(result["data"])
            return result
        except Exception as e:
            logger.error(f"Failed to import wishes: {e}")
            return {"success": False, "error": str(e)}
        
    def predict_wishes(self, current_pity, banner_type, guaranteed=False, pulls=40):
        try:
            result = self.predictor_service.predict(
                current_pity, banner_type, guaranteed, pulls
            )
            return result
        except Exception as e:
            logger.error(f"Failed to predict wishes: {e}")
            return {"success": False, "error": str(e)}
    
    def train_prediction_model(self):
        try:
            # Get current wish history
            history = self.wish_service.get_history()
            if not history:
                return {"success": False, "error": "No wish history available for training"}
            
            # Train model with the wish history
            result = self.model_trainer_service.train_model_with_user_data(history)
            return result
        except Exception as e:
            logger.error(f"Failed to train model: {e}")
            return {"success": False, "error": str(e)}
    
    def get_wish_history(self):
        try:
            history = self.wish_service.get_history()
            history_with_pity = self.pity_calculator.calculate_pull_counts(history)
            return {"success": True, "data": history_with_pity}
        except Exception as e:
            logger.error(f"Failed to get wish history: {e}")
            return {"success": False, "error": str(e)}
    
    def calculate_pity(self):
        try:
            history = self.wish_service.get_history()
            character_pity = self.pity_calculator.calculate(history, 'character')
            weapon_pity = self.pity_calculator.calculate(history, 'weapon')
            stats = self.pity_calculator.calculate_stats(history)
            
            return {
                "success": True,
                "data": {
                    "character": character_pity,
                    "weapon": weapon_pity,
                    "stats": stats
                }
            }
        except Exception as e:
            logger.error(f"Failed to calculate pity: {e}")
            return {"success": False, "error": str(e)}

    def export_data(self, format='json'):
        try:
            result = self.data_service.export_data(format)
            return result
        except Exception as e:
            logger.error(f"Failed to export data: {e}")
            return {"success": False, "error": str(e)}

    def import_data(self, file_content):
        try:
            if isinstance(file_content, dict):
                file_content = file_content.get('file_path', '')
            result = self.data_service.import_data(file_content)
            return result
        except Exception as e:
            logger.error(f"Failed to import data: {e}")
            return {"success": False, "error": str(e)}

    def reset_data(self):
        try:
            result = self.data_service.reset_data()
            return result
        except Exception as e:
            logger.error(f"Failed to reset data: {e}")
            return {"success": False, "error": str(e)}

    def get_auto_update_setting(self):
        """Get the automatic update check setting."""
        try:
            return self.update_service.get_auto_check()
        except Exception as e:
            logger.error(f"Failed to get auto update setting: {e}")
            return {"success": False, "error": str(e)}

    def set_auto_update_setting(self, enabled):
        """Enable or disable automatic update checks."""
        try:
            return self.update_service.set_auto_check(enabled)
        except Exception as e:
            logger.error(f"Failed to set auto update setting: {e}")
            return {"success": False, "error": str(e)}

    def check_for_updates(self, force=False):
        """Check if an update is available."""
        try:
            return self.update_service.check_for_updates(force)
        except Exception as e:
            logger.error(f"Failed to check for updates: {e}")
            return {"success": False, "error": str(e)}
            
    # Firebase related methods
    def check_firebase_connection(self):
        """Check if Firebase is properly initialized."""
        try:
            is_initialized = firebase_service.ensure_initialized()
            return {
                "success": True,
                "initialized": is_initialized
            }
        except Exception as e:
            logger.error(f"Firebase connection check error: {e}")
            return {"success": False, "error": str(e)}

def main():
    try:
        # Create base model if it doesn't exist
        create_base_model()
        
        # Initialize Firebase
        firebase_initialized = initialize_firebase()
        logger.info(f"Firebase initialization {'succeeded' if firebase_initialized else 'failed'}")
        
        # Set up app ID for Windows
        if os.name == 'nt':
            try:
                import ctypes
                myappid = 'sarpowsky.pitypal.1.0.0'
                ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
            except Exception as e:
                logger.error(f"Failed to set app ID: {e}")
        
        api = API()
        
        # Simple background update check
        def check_updates_background():
            try:
                api.update_service.check_for_updates()
            except Exception as e:
                logger.error(f"Background update check failed: {e}")
        
        # Start update check
        threading.Thread(target=check_updates_background, daemon=True).start()
        
        # Get the application directory
        if getattr(sys, 'frozen', False):
            base_dir = sys._MEIPASS
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        
        logger.info(f"Base directory: {base_dir}")
        
        # Find web assets
        web_dir = os.path.join(base_dir, 'web')
        web_index = os.path.join(web_dir, 'index.html')
        
        logger.info(f"Web directory: {web_dir}")
        logger.info(f"Web index: {web_index}")
        
        # Check if web directory exists and has files
        if os.path.exists(web_dir):
            files = os.listdir(web_dir)
            logger.info(f"Web directory contents: {files}")
            if 'index.html' not in files:
                logger.error("index.html not found in web directory!")
        else:
            logger.error(f"Web directory not found: {web_dir}")
        
        # Development URL for hot reloading
        DEV_URL = 'http://localhost:5173'
        
        # Production URL
        PROD_URL = web_index

        os.environ['DEVELOPMENT'] = 'true' # will remove
        
        # Choose the appropriate URL
        if os.environ.get('DEVELOPMENT') == 'true':
            url_to_use = DEV_URL
            logger.info(f"Using development URL: {url_to_use}")
        else:
            url_to_use = PROD_URL
            logger.info(f"Using production path: {url_to_use}")
        
        # Create window using the proper file path
        window = webview.create_window(
            'PityPal by sarpowsky',
            url=url_to_use,
            js_api=api,
            width=1200,
            height=800,
            resizable=True
        )
        
        # Start webview with http_server (but no user_data_path parameter)
        webview.start(debug=True, http_server=True)
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        raise

if __name__ == '__main__':
    main()