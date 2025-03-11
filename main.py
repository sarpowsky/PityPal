# Path: main.py

from backend.services.pity_predictor.predictor_service import PredictorService
from backend.services.pity_predictor.model_trainer_service import ModelTrainerService
import webview
import json
import os
import logging
from pathlib import Path
from backend.services.wish_service import WishService
from backend.services.pity_calculator import PityCalculator
from backend.services.data_service import DataService
from backend.services.update_service import UpdateService
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
def main():
    try:
        # Create base model if it doesn't exist
        create_base_model()
        
        api = API()
        
        # Check for updates in the background
        def check_updates_background():
            try:
                update_result = api.update_service.check_for_updates()
                if update_result.get('success') and update_result.get('update_available'):
                    # Log update availability
                    logger.info(f"Update available: {update_result.get('latest_version')}")
                    # Could add notification here if desired
            except Exception as e:
                logger.error(f"Background update check failed: {e}")
        
        # Start update check in a thread to avoid delaying app startup
        import threading
        update_thread = threading.Thread(target=check_updates_background)
        update_thread.daemon = True
        update_thread.start()
        
        # Development URL for hot reloading 
        DEV_URL = 'http://localhost:5173'
        # Production URL pointing to built files
        PROD_URL = 'web/index.html'  # For deployment, use this
        
        # Choose the appropriate URL based on environment
        url_to_use = DEV_URL
        if not os.environ.get('DEVELOPMENT') and os.path.exists('web/index.html'):
            url_to_use = PROD_URL

        window = webview.create_window(
            'Genshin Impact Pity Tracker',
            url=url_to_use,
            js_api=api,
            width=1200,
            height=800,
            resizable=True,
        )
        webview.start(debug=True)
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        raise

if __name__ == '__main__':
    main()