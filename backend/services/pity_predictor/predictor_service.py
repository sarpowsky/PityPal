import os
import logging
import json
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server environments
import matplotlib.pyplot as plt
from pathlib import Path
from io import BytesIO  # Use BytesIO instead of temp files
import base64
from .predict import get_pity_thresholds, predict_next_pulls, calculate_cumulative_probability, plot_probabilities

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
        
    def _generate_pull_insights(self, current_pity, banner_type, guaranteed, 
                           pull_50pct, pull_90pct, confidence_interval,
                           primogems_50pct, primogems_90pct):
        """Generate plain-language insights about the prediction results."""
        
        thresholds = get_pity_thresholds(banner_type)
        hard_pity = thresholds['hard_pity']
        soft_pity = thresholds['soft_pity']
        
        insights = []
        
        # Current pity status
        if current_pity >= soft_pity:
            insights.append(f"You're in soft pity (starts at {soft_pity})! Your 5★ chances are significantly increased.")
        elif current_pity >= soft_pity - 10:
            insights.append(f"You're getting close to soft pity at {soft_pity} pulls. Just {soft_pity - current_pity} more pulls!")
        else:
            insights.append(f"You're at {current_pity} pity. Soft pity begins at {soft_pity} pulls.")
        
        # 50/50 vs Guaranteed
        if guaranteed:
            insights.append("You're guaranteed to get the featured character on your next 5★!")
        else:
            insights.append("You're on 50/50 for your next 5★ (plus 10% Capturing Radiance chance if you lose 50/50).")
        
        # Pull prediction
        if pull_50pct:
            pulls_needed_50 = pull_50pct - current_pity
            insights.append(f"You have a 50% chance of getting a 5★ within {pulls_needed_50} pulls (pity {pull_50pct}).")
            
            if primogems_50pct:
                insights.append(f"That's about {primogems_50pct} primogems for a 50% chance.")
        
        if pull_90pct:
            pulls_needed_90 = pull_90pct - current_pity
            insights.append(f"You have a 90% chance of getting a 5★ within {pulls_needed_90} pulls (pity {pull_90pct}).")
            
            if primogems_90pct:
                insights.append(f"That's about {primogems_90pct} primogems for a 90% chance.")
        
        # Confidence interval
        if confidence_interval > 0:
            insights.append(f"The model predicts a ±{confidence_interval} pull confidence interval around these estimates.")
        
        # Hard pity guarantee
        remaining_to_hard = hard_pity - current_pity
        if remaining_to_hard > 0:
            insights.append(f"You're guaranteed a 5★ within {remaining_to_hard} pulls at hard pity ({hard_pity}).")
        else:
            insights.append(f"You've reached hard pity ({hard_pity})! Your next pull will 100% be a 5★!")
        
        return insights

    def predict(self, current_pity, banner_type, guaranteed=False, n_pulls=40):
        """
        Predict 5-star probabilities for the next n pulls with enhanced insights.
        
        Args:
            current_pity: Current pity count
            banner_type: Type of banner (character-1, character-2, weapon, permanent)
            guaranteed: Whether the next 5-star is guaranteed
            n_pulls: Number of future pulls to predict
            
        Returns:
            dict: Prediction results including probabilities, chart image, and insights
        """
        try:
            # First check if we have any model
            if not self._ensure_model_exists():
                return {
                    "success": False,
                    "error": "No prediction model available. Try training the model first with your wish history."
                }
                
            model_path = self.get_model_path()
            
            # Get thresholds for this banner type
            thresholds = get_pity_thresholds(banner_type)
            hard_pity = thresholds['hard_pity']
            soft_pity = thresholds['soft_pity']
            
            # Adjust n_pulls to not exceed hard pity
            remaining_to_hard_pity = max(0, hard_pity - current_pity)
            n_pulls = min(n_pulls, remaining_to_hard_pity)
            
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
            
            # Calculate confidence interval
            confidence_interval = 0
            if pull_50pct and pull_90pct:
                confidence_interval = max(1, pull_90pct - pull_50pct)
            
            # Calculate primogems needed
            primogems_50pct = (pull_50pct - current_pity) * 160 if pull_50pct else None
            primogems_90pct = (pull_90pct - current_pity) * 160 if pull_90pct else None
            
            # Generate insights text
            insights = self._generate_pull_insights(
                current_pity, banner_type, guaranteed, pull_50pct, pull_90pct, 
                confidence_interval, primogems_50pct, primogems_90pct
            )
            
            return {
                "success": True,
                "predictions": pity_predictions,
                "chart_image": img_data,
                "summary": {
                    "current_pity": current_pity,
                    "guaranteed": guaranteed,
                    "banner_type": banner_type,
                    "pull_50pct": pull_50pct,
                    "pull_90pct": pull_90pct,
                    "confidence_interval": confidence_interval,
                    "primogems_50pct": primogems_50pct,
                    "primogems_90pct": primogems_90pct,
                    "insights": insights
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "success": False,
                "error": str(e)
            }