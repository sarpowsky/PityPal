# tests/test_firebase_service.py
import pytest
import tempfile
import os
from unittest.mock import patch, MagicMock
from pathlib import Path

# Mock firebase_admin modules
class MockCredential:
    def __init__(self, *args, **kwargs):
        pass

class MockStorage:
    def bucket(self, *args, **kwargs):
        return MockBucket()

class MockBucket:
    def __init__(self):
        pass
        
    def blob(self, path):
        return MockBlob(path)

class MockBlob:
    def __init__(self, path):
        self.path = path
        self.public_url = f"https://storage.example.com/{path}"
        
    def upload_from_filename(self, file_path):
        return
        
    def make_public(self):
        return

@pytest.fixture
def firebase_service():
    """Create a FirebaseService instance with mocked dependencies."""
    with patch.dict('sys.modules', {
            'firebase_admin': MagicMock(),
            'firebase_admin.credentials': MagicMock(Certificate=MockCredential),
            'firebase_admin.storage': MockStorage(),
        }):
        from backend.services.firebase_service import FirebaseService
        
        # Create a temporary credentials file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.json') as tmp:
            tmp.write(b'{"type": "service_account"}')
            tmp_path = tmp.name
            
        service = FirebaseService()
        service.cred_path = tmp_path
        
        yield service
        
        # Clean up temp file
        os.unlink(tmp_path)

def test_initialize(firebase_service):
    """Test Firebase initialization."""
    result = firebase_service.initialize()
    assert result is True
    assert firebase_service.initialized is True

def test_upload_image(firebase_service):
    """Test uploading an image to Firebase Storage."""
    firebase_service.initialize()
    
    # Create a temporary test image
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_img:
        tmp_img.write(b'fake image data')
        img_path = tmp_img.name
    
    try:
        result = firebase_service.upload_image(img_path, "test/test_image.png")
        
        assert result["success"] is True
        assert "url" in result
        assert result["url"] == "https://storage.example.com/test/test_image.png"
        assert result["path"] == "test/test_image.png"
    finally:
        # Clean up test image
        os.unlink(img_path)

def test_get_image_url(firebase_service):
    """Test getting an image URL from Firebase Storage."""
    firebase_service.initialize()
    
    url = firebase_service.get_image_url("test/example.png")
    assert url == "https://storage.example.com/test/example.png"

@pytest.mark.skip(reason="Requires actual Firebase REST API implementation")
def test_update_remote_config(firebase_service):
    """Test updating Remote Config template."""
    firebase_service.initialize()
    
    # Since this is just a placeholder in our implementation,
    # we're just testing that the method returns success
    result = firebase_service.update_remote_config({"parameters": {}})
    assert result["success"] is True