# Path: backend/services/wish_service.py
import json
import time
import sqlite3
import requests
import pandas as pd
import platform
from datetime import datetime
from pathlib import Path
import logging
from typing import Dict, List, Optional, Callable
from urllib.parse import parse_qs, urlparse
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WishService:
    def __init__(self):
        self.api_base = "https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api"
        self.banner_types = {
            "301": "character-1",    # First character event banner
            "400": "character-2",    # Second character event banner
            "302": "weapon",         # Weapon banner
            "200": "permanent",      # Standard banner
            "500": "chronicled"      # Chronicled wish
        }
        self.history = []
        if platform.system() == "Windows":
            self.db_path = Path.home() / "AppData/Local/GenshinWishTracker/wishes.db"
        elif platform.system() == "Darwin":  # macOS
            self.db_path = Path.home() / "Library/Application Support/GenshinWishTracker/wishes.db"
        else:  # Linux and others
            self.db_path = Path.home() / ".genshinwishtracker/wishes.db"
            
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
        self.load_history()
        self.session = self._create_session()
    
    def _create_session(self):
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def init_database(self):
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
                conn.execute('CREATE INDEX IF NOT EXISTS idx_wishes_time ON wishes(time)')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_wishes_bannerType ON wishes(bannerType)')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_wishes_rarity ON wishes(rarity)')
                logger.info("Database initialized successfully")
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise

    def load_history(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute('SELECT * FROM wishes ORDER BY time DESC')
                self.history = [dict(row) for row in cursor.fetchall()]
                logger.info(f"Loaded {len(self.history)} wishes from database")
        except sqlite3.Error as e:
            logger.error(f"Failed to load wish history: {e}")
            self.history = []

    def get_history(self):
        """Get wish history with proper refresh"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute('SELECT * FROM wishes ORDER BY time DESC')
                self.history = [dict(row) for row in cursor.fetchall()]
                logger.info(f"Loaded {len(self.history)} wishes from database")
                return self.history
        except sqlite3.Error as e:
            logger.error(f"Failed to load wish history: {e}")
            return []

    def parse_url(self, url: str) -> Dict:
        try:
            parsed = urlparse(url)
            params = parse_qs(parsed.query)
            return {k: v[0] for k, v in params.items()}
        except Exception as e:
            logger.error(f"URL parsing failed: {e}")
            raise ValueError("Invalid URL format")

    def import_from_url(self, url: str, progress_callback: Optional[Callable] = None) -> Dict:
        try:
            if progress_callback:
                progress_callback(5)

            params = self.parse_url(url)
            if 'authkey' not in params:
                raise ValueError("Authentication key not found in URL")

            logger.info("Starting wish history fetch...")
            if progress_callback:
                progress_callback(10)

            all_wishes = []
            for banner_id in self.banner_types:
                current_params = {**params, "gacha_type": banner_id}
                current_params['page'] = '1'
                current_params['size'] = '20'
                current_params['end_id'] = '0'

                while True:
                    try:
                        response = self.session.get(
                            f"{self.api_base}/getGachaLog", 
                            params=current_params,
                            timeout=(5, 15)  # Connect timeout, Read timeout
                        )
                        data = response.json()
                        
                        if data["retcode"] != 0:
                            error_msg = data.get('message', 'Unknown error')
                            logger.error(f"API Error: {error_msg}")
                            raise Exception(f"API Error: {error_msg}")

                        wishes = data["data"]["list"]
                        if not wishes:
                            break

                        all_wishes.extend(wishes)
                        current_params['end_id'] = wishes[-1]["id"]
                        time.sleep(0.5)  # Rate limiting

                        if progress_callback:
                            progress = min(90, len(all_wishes) / 2)
                            progress_callback(int(progress))
                    except requests.RequestException as e:
                        logger.error(f"Network error: {e}")
                        raise Exception(f"Failed to connect to wish history server: {e}")

            if progress_callback:
                progress_callback(95)

            processed_wishes = self._process_wish_data(all_wishes)
            self.save_wishes(processed_wishes)
            self.history = processed_wishes

            if progress_callback:
                progress_callback(100)

            return {
                "success": True,
                "data": processed_wishes,
                "message": f"Successfully imported {len(processed_wishes)} wishes"
            }

        except Exception as e:
            logger.error(f"Wish import failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def _process_wish_data(self, wishes: List[Dict]) -> List[Dict]:
        processed_wishes = []
        for wish in wishes:
            try:
                if not all(field in wish for field in ('id', 'name', 'rank_type', 'item_type', 'time', 'gacha_type')):
                    continue
                    
                processed_wish = {
                    "id": wish["id"],
                    "name": wish["name"].strip(),  # Ensure clean character names
                    "rarity": int(wish["rank_type"]),
                    "type": wish["item_type"],
                    "time": wish["time"],
                    "bannerType": self.banner_types.get(wish["gacha_type"], "unknown")
                }
                processed_wishes.append(processed_wish)
            except (ValueError, KeyError) as e:
                logger.error(f"Failed to process wish: {e}")
                continue

        return sorted(processed_wishes, key=lambda x: x["time"], reverse=True)

    def save_wishes(self, wishes):
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
                        wish['time'],
                        wish['bannerType']
                    ))
                logger.info(f"Saved {len(wishes)} wishes to database")
        except sqlite3.Error as e:
            logger.error(f"Failed to save wishes: {e}")
            raise

    def clear_history(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('DELETE FROM wishes')
            self.history = []
            logger.info("Wish history cleared")
        except sqlite3.Error as e:
            logger.error(f"Failed to clear history: {e}")
            raise

    def export_to_excel(self):
        try:
            if not self.history:
                return {"success": False, "error": "No wish history to export"}

            df = pd.DataFrame(self.history)
            
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

            return {
                "success": True,
                "path": filepath,
                "filename": filename
            }
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return {"success": False, "error": str(e)}