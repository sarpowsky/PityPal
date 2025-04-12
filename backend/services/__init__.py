# Path: backend/services/__init__.py

# Import services
from .wish_service import WishService
from .pity_calculator import PityCalculator
from .data_service import DataService
from .pity_predictor.predictor_service import PredictorService
from .pity_predictor.model_trainer_service import ModelTrainerService
from .update_service import UpdateService
from .firebase_service import firebase_service, initialize_firebase

# Initialize Firebase on module import
initialize_firebase()