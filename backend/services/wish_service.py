# Path: backend/services/wish_service.py
import json
import requests
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path

class WishService:
    def __init__(self):
        self.api_base = "https://hk4e-api-os.mihoyo.com/event/gacha_info/api"
        self.banner_types = {
            "301": "character",
            "302": "weapon",
            "200": "permanent"
        }
        self.history = []
        
    def import_from_url(self, url):
        try:
            auth_key = self._extract_authkey(url)
            data = self._fetch_all_history(auth_key)
            self.history = self._process_wish_data(data)
            return {"success": True, "data": self.history}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _extract_authkey(self, url):
        try:
            if 'authkey' not in url:
                raise ValueError("Invalid URL: No authkey found")
            return url.split('authkey=')[1].split('&')[0]
        except Exception:
            raise ValueError("Failed to extract authkey from URL")

    def _fetch_all_history(self, auth_key):
        all_wishes = []
        for banner_id in self.banner_types:
            end_id = "0"
            while True:
                params = {
                    "authkey_ver": 1,
                    "authkey": auth_key,
                    "gacha_type": banner_id,
                    "page": "1",
                    "size": "20",
                    "end_id": end_id
                }
                response = requests.get(f"{self.api_base}/getGachaLog", params=params)
                data = response.json()
                
                if data["retcode"] != 0:
                    raise Exception(f"API Error: {data['message']}")
                
                wishes = data["data"]["list"]
                if not wishes:
                    break
                    
                all_wishes.extend(wishes)
                end_id = wishes[-1]["id"]
                
        return all_wishes

    def _process_wish_data(self, wishes):
        processed_wishes = []
        for wish in wishes:
            processed_wish = {
                "id": wish["id"],
                "name": wish["name"],
                "rarity": int(wish["rank_type"]),
                "type": wish["item_type"],
                "time": datetime.strptime(wish["time"], "%Y-%m-%d %H:%M:%S"),
                "bannerType": self.banner_types[wish["gacha_type"]]
            }
            processed_wishes.append(processed_wish)
        
        return sorted(processed_wishes, key=lambda x: x["time"], reverse=True)

    def export_to_excel(self):
        try:
            if not self.history:
                return {"success": False, "error": "No wish history to export"}

            df = pd.DataFrame(self.history)
            
            # Format datetime
            df['time'] = pd.to_datetime(df['time']).dt.strftime('%Y-%m-%d %H:%M:%S')
            
            # Calculate pity for each banner type
            for banner_type in set(df['bannerType']):
                mask = df['bannerType'] == banner_type
                df.loc[mask, 'pity'] = df[mask].groupby(
                    (df[mask]['rarity'] == 5).cumsum()
                ).cumcount() + 1
            
            # Save to user's documents folder
            documents_path = str(Path.home() / "Documents")
            filename = f"genshin_wishes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            filepath = f"{documents_path}/{filename}"
            
            # Create Excel writer with formatting
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Wish History')
                
                # Auto-adjust column widths
                worksheet = writer.sheets['Wish History']
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).apply(len).max(),
                        len(col)
                    )
                    worksheet.column_dimensions[chr(65 + idx)].width = max_length + 2

            return {
                "success": True,
                "path": filepath,
                "filename": filename
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_history(self):
        return self.history