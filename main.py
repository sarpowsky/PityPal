# Path: main.py
import webview
import json
import os
import logging
from pathlib import Path
from backend.services.wish_service import WishService
from backend.services.pity_calculator import PityCalculator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class API:
    def __init__(self):
        self.wish_service = WishService()
        self.pity_calculator = PityCalculator()
        logger.info("API services initialized")
        
    def get_wish_history(self):
        try:
            history = self.wish_service.get_history()
            return {"success": True, "data": history}
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
    
    def import_wishes(self, url):
        try:
            result = self.wish_service.import_from_url(url)
            if result["success"]:
                self.pity_calculator.clear_cache()
            return result
        except Exception as e:
            logger.error(f"Failed to import wishes: {e}")
            return {"success": False, "error": str(e)}
    
    def export_data(self):
        try:
            return self.wish_service.export_to_excel()
        except Exception as e:
            logger.error(f"Failed to export data: {e}")
            return {"success": False, "error": str(e)}

def create_app_folder():
    app_dir = Path.home() / "AppData/Local/GenshinWishTracker"
    app_dir.mkdir(parents=True, exist_ok=True)
    return app_dir

def main():
    try:
        app_dir = create_app_folder()
        logger.info(f"Application directory: {app_dir}")
        
        api = API()
        window = webview.create_window(
            'Genshin Impact Pity Tracker',
            url='frontend/build/index.html',
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