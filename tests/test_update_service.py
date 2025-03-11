# tests/test_update_service.py
import pytest
from unittest.mock import patch, MagicMock
from packaging import version
from backend.services.update_service import UpdateService

class TestUpdateService:
    @pytest.fixture
    def service(self, tmp_path):
        with patch('backend.services.update_service.Path.home') as mock_home:
            mock_home.return_value = tmp_path
            service = UpdateService(current_version="1.0.0")
            return service
    
    def test_get_auto_check(self, service):
        """Test getting auto-update setting."""
        result = service.get_auto_check()
        assert result["success"] is True
        assert isinstance(result["auto_check"], bool)
    
    @patch('backend.services.update_service.requests.get')
    def test_check_for_updates_new_version(self, mock_get, service):
        """Test checking for updates with new version available."""
        # Mock the requests response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "tag_name": "v1.1.0",
            "assets": [{"browser_download_url": "https://example.com/download"}],
            "body": "Release notes"
        }
        mock_get.return_value = mock_response
        
        # Call the method
        result = service.check_for_updates(force=True)
        
        # Verify results
        assert result["success"] is True
        assert result["update_available"] is True
        assert result["current_version"] == "1.0.0"
        assert result["latest_version"] == "1.1.0"
    
    @patch('backend.services.update_service.requests.get')
    def test_check_for_updates_current_version(self, mock_get, service):
        """Test checking for updates when already on latest version."""
        # Mock the requests response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "tag_name": "v1.0.0",  # Same as current
            "assets": [{"browser_download_url": "https://example.com/download"}],
            "body": "Release notes"
        }
        mock_get.return_value = mock_response
        
        # Call the method
        result = service.check_for_updates(force=True)
        
        # Verify results
        assert result["success"] is True
        assert result["update_available"] is False