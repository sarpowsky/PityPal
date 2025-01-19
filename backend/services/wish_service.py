# Path: backend/services/wish_service.py
import json
import sqlite3
import requests
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WishService:
    def __init__(self):
        self.api_base = "https://hk4e-api-os.mihoyo.com/event/gacha_info/api"
        self.banner_types = {
            "301": "character",
            "302": "weapon",
            "200": "permanent"
        }
        self.db_path = Path.home() / "AppData/Local/GenshinWishTracker/wishes.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
        self.load_history()

    def init_database(self):
        """Initialize SQLite database for persistent storage"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS wishes (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        rarity INTEGER NOT NULL,
                        type TEXT NOT NULL,
                        time TIMESTAMP NOT NULL,
                        bannerType TEXT NOT NULL
                    )
                ''')
                logger.info("Database initialized successfully")
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise

    def load_history(self):
        """Load wish history from database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute('SELECT * FROM wishes ORDER BY time DESC')
                self.history = [dict(row) for row in cursor.fetchall()]
                logger.info(f"Loaded {len(self.history)} wishes from database")
        except sqlite3.Error as e:
            logger.error(f"Failed to load wish history: {e}")
            self.history = []

    def save_wishes(self, wishes):
        """Save wishes to local database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                for wish in wishes:
                    conn.execute('''
                        INSERT OR REPLACE INTO wishes 
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        wish['id'],
                        wish['name'],
                        wish['rarity'],
                        wish['type'],
                        wish['time'].strftime('%Y-%m-%d %H:%M:%S'),
                        wish['bannerType']
                    ))
                logger.info(f"Saved {len(wishes)} wishes to database")
        except sqlite3.Error as e:
            logger.error(f"Failed to save wishes: {e}")
            raise

    def import_from_url(self, url):
        """Import wishes from game URL"""
        try:
            auth_key = self._extract_authkey(url)
            data = self._fetch_all_history(auth_key)
            processed_wishes = self._process_wish_data(data)
            self.save_wishes(processed_wishes)
            self.history = processed_wishes
            return {"success": True, "data": processed_wishes}
        except Exception as e:
            logger.error(f"Wish import failed: {e}")
            return {"success": False, "error": str(e)}

    def _extract_authkey(self, url):
        try:
            if 'authkey' not in url:
                raise ValueError("Invalid URL: No authkey found")
            return url.split('authkey=')[1].split('&')[0]
        except Exception as e:
            logger.error(f"Authkey extraction failed: {e}")
            raise ValueError("Failed to extract authkey from URL")

    def _fetch_all_history(self, auth_key):
        all_wishes = []
        try:
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
                    response = requests.get(
                        f"{self.api_base}/getGachaLog",
                        params=params,
                        timeout=10
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if data["retcode"] != 0:
                        raise Exception(f"API Error: {data['message']}")
                    
                    wishes = data["data"]["list"]
                    if not wishes:
                        break
                        
                    all_wishes.extend(wishes)
                    end_id = wishes[-1]["id"]
            
            logger.info(f"Fetched {len(all_wishes)} wishes")
            return all_wishes
        except requests.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise

    def _process_wish_data(self, wishes):
        """Process and validate wish data"""
        processed_wishes = []
        required_fields = ['id', 'name', 'rank_type', 'item_type', 'time', 'gacha_type']
        
        for wish in wishes:
            # Validate required fields
            if not all(field in wish for field in required_fields):
                logger.warning(f"Skipping invalid wish data: {wish}")
                continue
                
            try:
                processed_wish = {
                    "id": wish["id"],
                    "name": wish["name"],
                    "rarity": int(wish["rank_type"]),
                    "type": wish["item_type"],
                    "time": datetime.strptime(wish["time"], "%Y-%m-%d %H:%M:%S"),
                    "bannerType": self.banner_types[wish["gacha_type"]]
                }
                processed_wishes.append(processed_wish)
            except (ValueError, KeyError) as e:
                logger.error(f"Failed to process wish: {e}")
                continue

        return sorted(processed_wishes, key=lambda x: x["time"], reverse=True)

    def get_history(self):
        """Get current wish history"""
        return self.history

    def export_to_excel(self):
        """Export wish history to Excel"""
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
            
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Wish History')
                
                worksheet = writer.sheets['Wish History']
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).apply(len).max(),
                        len(col)
                    )
                    worksheet.column_dimensions[chr(65 + idx)].width = max_length + 2

            logger.info(f"Exported wishes to {filepath}")
            return {
                "success": True,
                "path": filepath,
                "filename": filename
            }
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return {"success": False, "error": str(e)}