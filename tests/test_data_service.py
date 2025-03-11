# tests/test_data_service.py
import pytest
import json
import sqlite3
from unittest.mock import patch, mock_open
from pathlib import Path
from backend.services.data_service import DataService

class TestDataService:
    @pytest.fixture
    def service(self, tmp_path):
        with patch('backend.services.data_service.Path.home') as mock_home:
            mock_home.return_value = tmp_path
            service = DataService()
            return service
    
    @pytest.fixture
    def sample_data(self):
        return [
            {"id": "1", "name": "Test Character", "rarity": 5, "type": "Character", 
             "time": "2025-01-01 12:00:00", "bannerType": "character-1"}
        ]
    
    def test_get_wishes_empty(self, service):
        """Test getting wishes with empty database."""
        wishes = service.get_wishes()
        assert wishes == []
    
    def test_import_data(self, service, sample_data):
        """Test importing data."""
        # Convert sample_data to JSON string
        data_str = json.dumps(sample_data)
        
        # Import the data
        result = service.import_data(data_str)
        
        # Verify result
        assert result["success"] is True
        assert result["count"] == 1
        
        # Verify data was saved
        wishes = service.get_wishes()
        assert len(wishes) == 1
        assert wishes[0]["id"] == "1"