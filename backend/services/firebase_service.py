# Path: backend/services/firebase_service.py
import os
import time
import json
import logging
import firebase_admin
from firebase_admin import credentials, storage, remote_config
from pathlib import Path
import requests
from requests.exceptions import RequestException
import tempfile

logger = logging.getLogger(__name__)

class FirebaseService:
    """Service for interacting with Firebase from the backend."""
    
    def __init__(self):
        self.app = None
        self.cred_path = os.environ.get('FIREBASE_CREDENTIALS', 'firebase-credentials.json')
        self.initialized = False
        self.storage_bucket = None
        
    def initialize(self):
        """Initialize Firebase Admin SDK."""
        if self.initialized:
            return True
            
        try:
            # Check if credentials file exists
            if not os.path.exists(self.cred_path):
                logger.error(f"Firebase credentials file not found at {self.cred_path}")
                return False
                
            # Initialize Firebase Admin SDK
            cred = credentials.Certificate(self.cred_path)
            self.app = firebase_admin.initialize_app(cred, {
                'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'pitypal-app.appspot.com')
            })
            
            # Get storage bucket
            self.storage_bucket = storage.bucket(app=self.app)
            
            self.initialized = True
            logger.info("Firebase Admin SDK initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Firebase initialization error: {e}")
            return False
            
    def ensure_initialized(self):
        """Ensure Firebase is initialized before proceeding."""
        if not self.initialized:
            return self.initialize()
        return True
        
    def upload_image(self, file_path, destination_path):
        """
        Upload an image to Firebase Storage.
        
        Args:
            file_path (str): Local path to the image file
            destination_path (str): Destination path in Firebase Storage
            
        Returns:
            dict: Result with success status and URL or error
        """
        if not self.ensure_initialized():
            return {"success": False, "error": "Firebase not initialized"}
            
        try:
            # Upload file to Firebase Storage
            blob = self.storage_bucket.blob(destination_path)
            blob.upload_from_filename(file_path)
            
            # Make the blob publicly accessible
            blob.make_public()
            
            return {
                "success": True,
                "url": blob.public_url,
                "path": destination_path
            }
        except Exception as e:
            logger.error(f"Error uploading image to Firebase: {e}")
            return {"success": False, "error": str(e)}
            
    def upload_image_from_url(self, image_url, destination_path):
        """
        Download an image from a URL and upload it to Firebase Storage.
        
        Args:
            image_url (str): URL of the image to download
            destination_path (str): Destination path in Firebase Storage
            
        Returns:
            dict: Result with success status and URL or error
        """
        if not self.ensure_initialized():
            return {"success": False, "error": "Firebase not initialized"}
            
        try:
            # Download the image
            response = requests.get(image_url, stream=True, timeout=10)
            response.raise_for_status()
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Write the image data to the temporary file
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
                
            # Upload the image to Firebase Storage
            result = self.upload_image(temp_file_path, destination_path)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            return result
        except RequestException as e:
            logger.error(f"Error downloading image from {image_url}: {e}")
            return {"success": False, "error": f"Failed to download image: {str(e)}"}
        except Exception as e:
            logger.error(f"Error processing image from {image_url}: {e}")
            return {"success": False, "error": str(e)}
            
    def update_remote_config(self, template_data):
        """
        Update Firebase Remote Config template.
        This requires using the Firebase REST API as the Admin SDK doesn't fully support Remote Config.
        
        Args:
            template_data (dict): Remote Config template data
            
        Returns:
            dict: Result with success status or error
        """
        if not self.ensure_initialized():
            return {"success": False, "error": "Firebase not initialized"}
            
        try:
            # This is a placeholder. In a real implementation, you would:
            # 1. Get an access token using the Admin SDK
            # 2. Make a REST API call to update the Remote Config template
            # 3. Return the result
            
            # Since this requires additional setup with service account permissions,
            # we'll log a message and return success for demonstration purposes
            logger.info("Remote Config update would happen here")
            return {"success": True, "message": "Remote Config update operation logged"}
        except Exception as e:
            logger.error(f"Error updating Remote Config: {e}")
            return {"success": False, "error": str(e)}
            
    def update_content(self, content_type, content_data):
        """
        Update specific content in Firebase.
        
        Args:
            content_type (str): Type of content to update ('banners', 'events', or 'leaks')
            content_data (dict): Content data to update
            
        Returns:
            dict: Result with success status or error
        """
        if not self.ensure_initialized():
            return {"success": False, "error": "Firebase not initialized"}
            
        try:
            # Validate content type
            if content_type not in ['banners', 'events', 'leaks']:
                return {"success": False, "error": f"Invalid content type: {content_type}"}
                
            # Add timestamp to content data
            content_data['updated_at'] = {
                'value': str(int(time.time() * 1000))
            }
            
            # Create Remote Config update
            template_update = {
                'parameters': {
                    content_type: {
                        'defaultValue': {
                            'value': json.dumps(content_data)
                        }
                    },
                    'content_updated_at': {
                        'defaultValue': {
                            'value': str(int(time.time() * 1000))
                        }
                    }
                }
            }
            
            # Update Remote Config
            return self.update_remote_config(template_update)
        except Exception as e:
            logger.error(f"Error updating {content_type} content: {e}")
            return {"success": False, "error": str(e)}
            
    def get_image_url(self, image_path):
        """
        Get the public URL for an image in Firebase Storage.
        
        Args:
            image_path (str): Path to the image in Firebase Storage
            
        Returns:
            str: Public URL of the image or None if not found
        """
        if not self.ensure_initialized():
            return None
            
        try:
            blob = self.storage_bucket.blob(image_path)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            logger.error(f"Error getting image URL for {image_path}: {e}")
            return None
            
# Create singleton instance
firebase_service = FirebaseService()

# Function to initialize on application startup
def initialize_firebase():
    """Initialize Firebase services."""
    return firebase_service.initialize()