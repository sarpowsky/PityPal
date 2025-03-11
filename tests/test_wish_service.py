# tests/test_wish_service.py
import pytest
from unittest.mock import patch, MagicMock
from backend.services.wish_service import WishService

class TestWishService:
    @pytest.fixture
    def service(self, tmp_path):
        # Mock the db_path to use a temporary path
        with patch('backend.services.wish_service.Path.home') as mock_home:
            mock_home.return_value = tmp_path
            service = WishService()
            # Ensure database is initialized
            service.init_database()
            return service
    
    def test_init_database(self, service, tmp_path):
        """Test database initialization."""
        assert service.db_path.exists()
    
    def test_import_from_url(self, service):
        """Test importing wishes from URL."""
        # Replace the session with our mock
        service.session = MagicMock()
        
        # Mock parse_url to return expected params
        service.parse_url = MagicMock(return_value={
            'authkey': 'testkey'
        })
        
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "retcode": 0, 
            "data": {"list": [
                {"id": "123", "name": "Test Character", "rank_type": "5", 
                 "item_type": "Character", "time": "2025-01-01 12:00:00", "gacha_type": "301"}
            ]}
        }
        service.session.get.return_value = mock_response
        
        # Call the method with mock URL
        result = service.import_from_url("https://test-url.com?authkey=testkey")
        
        # Verify results
        assert result["success"] is True
        assert len(result["data"]) > 0