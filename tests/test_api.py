# tests/test_api.py
import pytest
from unittest.mock import patch, MagicMock
from main import API

class TestAPI:
    @pytest.fixture
    def api(self):
        with patch('main.WishService'), \
             patch('main.PityCalculator'), \
             patch('main.DataService'), \
             patch('main.PredictorService'), \
             patch('main.ModelTrainerService'), \
             patch('main.UpdateService'):
            return API()
    
    def test_import_wishes(self, api):
        """Test the import_wishes API method."""
        # Mock the wish_service's import_from_url method
        api.wish_service.import_from_url = MagicMock(return_value={
            "success": True,
            "data": [{"id": "1", "rarity": 5}]
        })
        
        # Mock the pity_calculator's calculate_pull_counts method
        api.pity_calculator.calculate_pull_counts = MagicMock(return_value=[
            {"id": "1", "rarity": 5, "pity": 10}
        ])
        
        # Call the API method
        result = api.import_wishes("https://test-url.com")
        
        # Verify the result
        assert result["success"] is True
        assert len(result["data"]) == 1
        assert result["data"][0]["pity"] == 10
        
        # Verify the methods were called
        api.wish_service.import_from_url.assert_called_once_with("https://test-url.com")
        api.pity_calculator.calculate_pull_counts.assert_called_once()