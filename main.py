# Path: main.py
import webview
import json
import os
from backend.services.wish_service import WishService
from backend.services.pity_calculator import PityCalculator

class API:
    def __init__(self):
        self.wish_service = WishService()
        self.pity_calculator = PityCalculator()
        
    def get_wish_history(self):
        return self.wish_service.get_history()
    
    def calculate_pity(self):
        return self.pity_calculator.calculate()
    
    def import_wishes(self, url):
        return self.wish_service.import_from_url(url)
    
    def export_data(self):
        return self.wish_service.export_to_excel()

def main():
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

if __name__ == '__main__':
    main()