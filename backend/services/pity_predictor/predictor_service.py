import os
import logging
import json
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server environments
import matplotlib.pyplot as plt
from pathlib import Path
from io import BytesIO  # Use BytesIO instead of temp files
import base64
from .predict import predict_next_pulls, calculate_cumulative_probability, plot_probabilities

logger = logging.getLogger(__name__)

class PredictorService:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "fine_tuned_model.pkl")
        self.base_model_path = os.path.join(os.path.dirname(__file__), "pretrained_model.pkl")
        self._ensure_model_exists()

    def _ensure_model_exists(self):
        """Ensure that at least the base model exists."""
        if not os.path.exists(self.model_path) and not os.path.exists(self.base_model_path):
            logger.warning("No prediction models found. Need to train model first.")
            return False
        elif not os.path.exists(self.model_path) and os.path.exists(self.base_model_path):
            self.model_path = self.base_model_path
            logger.info("Using base model for predictions")
        return True

    def get_model_path(self):
        """Return the path to the best available model."""
        if os.path.exists(self.model_path):
            return self.model_path
        elif os.path.exists(self.base_model_path):
            return self.base_model_path
        else:
            raise FileNotFoundError("No prediction model available")

    def predict(self, current_pity, banner_type, guaranteed=False, n_pulls=40):
        """
        Predict 5-star probabilities for the next n pulls.
        
        Args:
            current_pity: Current pity count
            banner_type: Type of banner (character-1, character-2, weapon, permanent)
            guaranteed: Whether the next 5-star is guaranteed
            n_pulls: Number of future pulls to predict
            
        Returns:
            dict: Prediction results including probabilities and chart image
        """
        try:
            # First check if we have any model
            if not self._ensure_model_exists():
                return {
                    "success": False,
                    "error": "No prediction model available. Try training the model first with your wish history."
                }
                
            model_path = self.get_model_path()
            
            # Get predictions
            probabilities = predict_next_pulls(
                current_pity, banner_type, guaranteed, n_pulls, model_path
            )
            
            # Calculate cumulative probability
            cumulative_probs = calculate_cumulative_probability(probabilities)
            
            # Generate plot
            fig = plot_probabilities(
                probabilities, cumulative_probs, current_pity, banner_type, guaranteed
            )
            
            # Use BytesIO to avoid file system issues
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            plt.close(fig)  # Properly close the figure to release resources
            
            # Get image data from buffer
            buffer.seek(0)
            img_data = base64.b64encode(buffer.read()).decode('utf-8')
            buffer.close()
            
            # Create results object
            pity_predictions = [
                {
                    "pull": current_pity + i + 1,
                    "probability": prob,
                    "cumulative": cum_prob
                }
                for i, (prob, cum_prob) in enumerate(zip(probabilities, cumulative_probs))
            ]
            
            # Find the pull with 50% and 90% chance
            pull_50pct = next((p["pull"] for p in pity_predictions if p["cumulative"] >= 0.5), None)
            pull_90pct = next((p["pull"] for p in pity_predictions if p["cumulative"] >= 0.9), None)
            
            return {
                "success": True,
                "predictions": pity_predictions,
                "chart_image": img_data,
                "summary": {
                    "current_pity": current_pity,
                    "guaranteed": guaranteed,
                    "banner_type": banner_type,
                    "pull_50pct": pull_50pct,
                    "pull_90pct": pull_90pct
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "success": False,
                "error": str(e)
            }