# Path: main.py
import webview
import json
import os
import logging
from pathlib import Path
from backend.services.wish_service import WishService
from backend.services.pity_calculator import PityCalculator
from backend.services.data_service import DataService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class API:
    def __init__(self):
        self.wish_service = WishService()
        self.pity_calculator = PityCalculator()
        self.data_service = DataService()
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

def main():
    try:
        api = API()
        
        # Development URL for hot reloading 
        DEV_URL = 'http://localhost:5173'
        # Production URL pointing to built files
        PROD_URL = 'web/index.html'  # Current URL, commented out for now

        window = webview.create_window(
            'Genshin Impact Pity Tracker',
            url=DEV_URL,
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