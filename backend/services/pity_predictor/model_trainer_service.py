import os
import logging
import json
import pickle
import copy
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelTrainerService:
    def __init__(self):
        self.base_model_path = os.path.join(os.path.dirname(__file__), "pretrained_model.pkl")
        self.fine_tuned_model_path = os.path.join(os.path.dirname(__file__), "fine_tuned_model.pkl")
        self._ensure_base_model_exists()

    def _ensure_base_model_exists(self):
        """Ensure that the base model exists."""
        if not os.path.exists(self.base_model_path):
            logger.warning("Base model not found. Predictions may not be available.")
            return False
        return True

    def preprocess_user_wishes(self, wishes, encoder):
        """Preprocess user wish data to calculate pity and create features."""
        try:
            # Convert to DataFrame
            df = pd.DataFrame(wishes)
            
            # Convert time to datetime
            df['time'] = pd.to_datetime(df['time'])
            
            # Sort by time
            df = df.sort_values('time')
            
            # Process each banner type separately
            banner_types = df['bannerType'].unique()
            all_processed = []
            
            # Normalize banner types - treat all character banners as one type
            banner_map = {}
            for banner in banner_types:
                if banner.startswith('character-'):
                    banner_map[banner] = 'character'
                else:
                    banner_map[banner] = banner
            
            # Group banners by normalized types
            grouped_banners = {}
            for banner in banner_types:
                normalized = banner_map[banner]
                if normalized not in grouped_banners:
                    grouped_banners[normalized] = []
                grouped_banners[normalized].extend(df[df['bannerType'] == banner].to_dict('records'))
            
            # Process each normalized banner group
            for banner_type, banner_wishes in grouped_banners.items():
                banner_df = pd.DataFrame(banner_wishes)
                banner_df['bannerType'] = banner_type  # Set normalized type
                
                # Calculate pity for each pull
                banner_df['pity'] = 1
                banner_df['since_last_5star'] = 1
                banner_df['guaranteed'] = False
                
                pity_counter = 0
                guarantee = False
                
                # Standard characters (for 50/50 system)
                standard_characters = ["Diluc", "Jean", "Keqing", "Mona", "Qiqi", "Tighnari", "Dehya"]
                
                # Sort by time for pity calculation
                banner_df = banner_df.sort_values('time')
                
                for i, (idx, row) in enumerate(banner_df.iterrows()):
                    banner_df.at[idx, 'since_last_5star'] = pity_counter
                    banner_df.at[idx, 'guaranteed'] = guarantee
                    
                    pity_counter += 1
                    
                    if row['rarity'] == 5:
                        # Check if it was a standard character on character banner
                        if banner_type == 'character' and row['name'] in standard_characters:
                            guarantee = True
                        else:
                            guarantee = False
                        pity_counter = 0
                
                all_processed.append(banner_df)
            
            # Combine all processed data
            processed_df = pd.concat(all_processed)
            
            # Create features for model training
            processed_df['is_5star'] = (processed_df['rarity'] == 5).astype(int)
            
            # Add banner-specific soft and hard pity thresholds
            processed_df['soft_pity'] = np.where(
                processed_df['bannerType'] == 'weapon',
                63,  # Weapon banner soft pity
                74   # Character banner soft pity
            )
            
            processed_df['hard_pity'] = np.where(
                processed_df['bannerType'] == 'weapon',
                80,  # Weapon banner hard pity
                90   # Character banner hard pity
            )
            
            # Add features for pity zones
            processed_df['in_soft_pity'] = (processed_df['since_last_5star'] >= processed_df['soft_pity']).astype(int)
            processed_df['pity_ratio'] = processed_df['since_last_5star'] / processed_df['hard_pity']
            
            # Add enhanced piecewise probability features
            processed_df['near_soft_pity'] = ((processed_df['since_last_5star'] >= processed_df['soft_pity'] - 5) & 
                                            (processed_df['since_last_5star'] < processed_df['soft_pity'])).astype(int)
            processed_df['mid_soft_pity'] = ((processed_df['since_last_5star'] >= processed_df['soft_pity']) & 
                                          (processed_df['since_last_5star'] < processed_df['soft_pity'] + 5)).astype(int)
            processed_df['late_soft_pity'] = ((processed_df['since_last_5star'] >= processed_df['soft_pity'] + 5) & 
                                           (processed_df['since_last_5star'] < processed_df['hard_pity'])).astype(int)
            processed_df['near_hard_pity'] = (processed_df['since_last_5star'] >= processed_df['hard_pity'] - 3).astype(int)
            
            # Handle new banner types by making a copy of the encoder and refitting if needed
            user_banner_types = set(processed_df['bannerType'].unique())
            encoder_banner_types = set(encoder.categories_[0])
            
            if not user_banner_types.issubset(encoder_banner_types):
                logger.warning("New banner types detected in user data. Using only known banner types.")
                processed_df = processed_df[processed_df['bannerType'].isin(encoder_banner_types)].copy()
            
            # One-hot encode banner type using the encoder
            try:
                banner_encoded = encoder.transform(processed_df[['bannerType']])
                banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
                banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=processed_df.index)
                
                # Combine features
                processed_df = pd.concat([processed_df, banner_df], axis=1)
            except ValueError as e:
                logger.error(f"Error encoding banner types: {e}")
                return None
            
            return processed_df
        except Exception as e:
            logger.error(f"Error preprocessing user wishes: {e}")
            return None

    def fine_tune_model(self, model, processed_df, feature_names, weight_user_data=5):
        """Fine-tune the pre-trained model with user data with enhanced weighting."""
        try:
            # Make a deep copy of the model to avoid modifying the original
            fine_tuned_model = copy.deepcopy(model)
            
            # Define features and target
            X = processed_df[feature_names]
            y = processed_df['is_5star']
            
            # Create sample weights to give more importance to user data
            sample_weight = np.ones(len(y)) * weight_user_data
            
            # Determine if this is a small dataset
            is_small_dataset = len(processed_df) < 500
            dataset_size_factor = 1.5 if is_small_dataset else 1.0
            
            # Enhanced weighting for rare events in small datasets
            five_star_weight = 20.0 * dataset_size_factor  # Increased from 18.0 to 20.0 and scaled for small datasets
            sample_weight[y == 1] *= five_star_weight
            
            # Give higher weight to samples in different pity zones
            # Scale factors are higher for small datasets
            near_soft_pity_mask = processed_df['near_soft_pity'] == 1
            sample_weight[near_soft_pity_mask] *= 2.0 * dataset_size_factor  # Higher weight as approaching soft pity
            
            soft_pity_mask = processed_df['in_soft_pity'] == 1
            sample_weight[soft_pity_mask] *= 3.0 * dataset_size_factor  # Emphasize soft pity zone
            
            mid_soft_pity_mask = processed_df['mid_soft_pity'] == 1
            sample_weight[mid_soft_pity_mask] *= 3.5 * dataset_size_factor  # Early soft pity phase
            
            late_soft_pity_mask = processed_df['late_soft_pity'] == 1
            sample_weight[late_soft_pity_mask] *= 4.0 * dataset_size_factor  # Late soft pity phase
            
            # Additional weight for samples near hard pity
            near_hard_pity_mask = processed_df['near_hard_pity'] == 1
            sample_weight[near_hard_pity_mask] *= 5.0 * dataset_size_factor  # Strong emphasis on near-hard-pity samples
            
            # Fine-tune the model
            fine_tuned_model.fit(X, y, sample_weight=sample_weight)
            
            logger.info(f"Fine-tuned model with {len(processed_df)} user wishes")
            logger.info(f"Number of 5-star pulls in user data: {y.sum()}")
            logger.info(f"5-star rate in user data: {y.mean():.4f}")
            
            # Additional insights for debugging
            if y.sum() > 0:
                soft_pity_5stars = sum((processed_df['in_soft_pity'] == 1) & (y == 1))
                logger.info(f"5-stars in soft pity zone: {soft_pity_5stars} ({soft_pity_5stars/y.sum()*100:.1f}%)")
                
                # Log banner-specific statistics
                for banner in processed_df['bannerType'].unique():
                    banner_mask = processed_df['bannerType'] == banner
                    banner_5stars = sum(banner_mask & (y == 1))
                    banner_count = sum(banner_mask)
                    if banner_count > 0:
                        logger.info(f"Banner {banner}: {banner_5stars} 5-stars in {banner_count} pulls ({banner_5stars/banner_count*100:.2f}%)")
            
            return fine_tuned_model
        except Exception as e:
            logger.error(f"Error fine-tuning model: {e}")
            return None

    def train_model_with_user_data(self, wishes):
        
        """Train a model using user's wish history data."""
        # This method takes the user's wish history and fine-tunes the prediction model
        # It requires at least 100 wishes to have enough data for meaningful training
        # The model is saved to fine_tuned_model.pkl for future predictions

        try:
            # Check if there's enough data
            if not wishes or len(wishes) < 100:
                logger.warning(f"Not enough wishes for training: {len(wishes) if wishes else 0}")
                return {
                    "success": False,
                    "error": f"Not enough wish data for training. Need at least 100 wishes, have {len(wishes) if wishes else 0}."
                }
            
            # Load the base model
            if not os.path.exists(self.base_model_path):
                return {
                    "success": False,
                    "error": "Base model not found. Cannot train model."
                }
            
            with open(self.base_model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            model = model_data['model']
            encoder = model_data['encoder']
            feature_names = model_data['feature_names']
            
            # Preprocess user wishes
            processed_df = self.preprocess_user_wishes(wishes, encoder)
            if processed_df is None or len(processed_df) == 0:
                return {
                    "success": False,
                    "error": "Failed to process wish data for training."
                }
            
            # If this is a small dataset, increase the user data weight
            dataset_size = len(processed_df)
            user_data_weight = 10.0 if dataset_size < 300 else 5.0
            logger.info(f"Using user data weight of {user_data_weight} for dataset size {dataset_size}")
            
            # Fine-tune the model
            fine_tuned_model = self.fine_tune_model(model, processed_df, feature_names, weight_user_data=user_data_weight)
            if fine_tuned_model is None:
                return {
                    "success": False,
                    "error": "Failed to fine-tune model."
                }
            
            # Save the fine-tuned model
            model_data_to_save = {
                'model': fine_tuned_model,
                'encoder': encoder,
                'feature_names': feature_names
            }
            
            with open(self.fine_tuned_model_path, 'wb') as f:
                pickle.dump(model_data_to_save, f)
            
            return {
                "success": True,
                "message": f"Successfully trained model using {len(processed_df)} wishes.",
                "stats": {
                    "total_wishes": len(processed_df),
                    "five_stars": int(processed_df['is_5star'].sum()),
                    "rate": float(processed_df['is_5star'].mean())
                }
            }
            
        except Exception as e:
            logger.error(f"Model training error: {e}")
            return {
                "success": False,
                "error": f"Training error: {str(e)}"
            }