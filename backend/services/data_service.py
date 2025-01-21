# Path: backend/services/data_service.py
import json
import sqlite3
import shutil
from datetime import datetime
from pathlib import Path
import logging
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)

class DataService:
    def __init__(self):
        self.app_data_path = Path.home() / "AppData/Local/GenshinWishTracker"
        self.db_path = self.app_data_path / "wishes.db"
        self.backups_path = self.app_data_path / "backups"
        self.backups_path.mkdir(parents=True, exist_ok=True)

    def _get_connection(self):
        """Create a new database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_table_exists(self, conn):
        """Ensure wishes table exists with correct schema"""
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
        conn.commit()

    def get_wishes(self) -> List[Dict]:
        """Get all wishes from database"""
        try:
            with self._get_connection() as conn:
                self._ensure_table_exists(conn)
                cursor = conn.execute('SELECT * FROM wishes ORDER BY time DESC')
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Failed to get wishes: {e}")
            return []

    def export_data(self, format: str = "json") -> Dict:
        """Export all data to JSON or Excel format"""
        try:
            wishes = self.get_wishes()
            if not wishes:
                return {"success": False, "error": "No data to export"}

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if format.lower() == "json":
                export_path = Path.home() / "Documents" / f"genshin_wishes_{timestamp}.json"
                with open(export_path, 'w', encoding='utf-8') as f:
                    json.dump(wishes, f, ensure_ascii=False, indent=2)
                return {
                    "success": True,
                    "path": str(export_path),
                    "count": len(wishes)
                }
            return {"success": False, "error": "Unsupported format"}
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return {"success": False, "error": str(e)}

    def import_data(self, file_content: str) -> Dict:
        """Import wishes from JSON data"""
        try:
            self._create_backup()
            wishes = json.loads(file_content)

            if not isinstance(wishes, list):
                raise ValueError("Invalid data format")

            required_fields = ['id', 'name', 'rarity', 'type', 'time', 'bannerType']
            for wish in wishes:
                if not all(field in wish for field in required_fields):
                    raise ValueError("Missing required fields in wish data")

            with self._get_connection() as conn:
                self._ensure_table_exists(conn)
                
                # Begin transaction
                conn.execute('BEGIN TRANSACTION')
                try:
                    # Clear existing data
                    conn.execute('DELETE FROM wishes')
                    
                    # Insert new data
                    conn.executemany('''
                        INSERT INTO wishes (id, name, rarity, type, time, bannerType)
                        VALUES (:id, :name, :rarity, :type, :time, :bannerType)
                    ''', wishes)
                    
                    # Commit transaction
                    conn.execute('COMMIT')
                except Exception as e:
                    conn.execute('ROLLBACK')
                    raise e

            return {
                "success": True,
                "count": len(wishes),
                "message": "Data imported successfully"
            }
        except Exception as e:
            logger.error(f"Import failed: {e}")
            return {"success": False, "error": str(e)}

    def reset_data(self) -> Dict:
        """Reset all data in database"""
        try:
            self._create_backup()
            with self._get_connection() as conn:
                self._ensure_table_exists(conn)
                conn.execute('BEGIN TRANSACTION')
                try:
                    conn.execute('DELETE FROM wishes')
                    conn.execute('COMMIT')
                except Exception as e:
                    conn.execute('ROLLBACK')
                    raise e
            return {
                "success": True,
                "message": "All data has been reset"
            }
        except Exception as e:
            logger.error(f"Reset failed: {e}")
            return {"success": False, "error": str(e)}

    def _create_backup(self) -> Optional[str]:
        """Create a backup of the current database"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.backups_path / f"wishes_backup_{timestamp}.db"
            
            if self.db_path.exists():
                shutil.copy2(self.db_path, backup_path)
                return str(backup_path)
            return None
        except Exception as e:
            logger.error(f"Backup failed: {e}")
            return None