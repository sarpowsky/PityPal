#!/usr/bin/env python3
# Path: backend/services/pity_predictor/create_base_model.py

"""
This script creates a basic pretrained model for pity prediction
if one doesn't exist. This allows the application to work
even without user training data.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_base_model():
    """Create a basic pretrained model based on pity mechanics"""
    output_path = os.path.join(os.path.dirname(__file__), "pretrained_model.pkl")
    
    if os.path.exists(output_path):
        logger.info(f"Base model already exists at {output_path}")
        return
    
    logger.info("Creating basic pretrained model...")
    
    # Create banner types
    banner_types = ['character-1', 'character-2', 'weapon', 'permanent', 'chronicled']
    
    # Create a basic dataset with reasonable pity distribution
    data = []
    
    for banner in banner_types:
        is_weapon = 'weapon' in banner
        soft_pity = 63 if is_weapon else 74
        hard_pity = 80 if is_weapon else 90
        
        # Base rate zone (pity 1-soft_pity)
        for pity in range(1, soft_pity):
            # Determine base rate (0.6% for characters, 0.7% for weapons)
            base_rate = 0.007 if is_weapon else 0.006
            
            # Create multiple samples at this pity
            for _ in range(100):
                got_5star = np.random.random() < base_rate
                data.append({
                    'bannerType': banner,
                    'since_last_5star': pity,
                    'guaranteed': np.random.choice([True, False]),
                    'in_soft_pity': 0,
                    'pity_ratio': pity / hard_pity,
                    'is_5star': int(got_5star)
                })
        
        # Soft pity zone
        for pity in range(soft_pity, hard_pity):
            # Soft pity increases rate significantly
            # Model this as linearly increasing probability
            rate_increase = (pity - soft_pity + 1) / (hard_pity - soft_pity) * 0.7
            adjusted_rate = 0.2 + rate_increase
            
            for _ in range(100):
                got_5star = np.random.random() < adjusted_rate
                data.append({
                    'bannerType': banner,
                    'since_last_5star': pity,
                    'guaranteed': np.random.choice([True, False]),
                    'in_soft_pity': 1,
                    'pity_ratio': pity / hard_pity,
                    'is_5star': int(got_5star)
                })
        
        # Hard pity is guaranteed
        data.append({
            'bannerType': banner,
            'since_last_5star': hard_pity,
            'guaranteed': np.random.choice([True, False]),
            'in_soft_pity': 1,
            'pity_ratio': 1.0,
            'is_5star': 1
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # One-hot encode banner type
    try:
        # For newer scikit-learn versions
        encoder = OneHotEncoder(sparse_output=False, drop='first')
    except TypeError:
        # For older scikit-learn versions
        encoder = OneHotEncoder(sparse=False, drop='first')
    
    banner_encoded = encoder.fit_transform(df[['bannerType']])
    banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
    banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=df.index)
    
    # Combine features
    df = pd.concat([df, banner_df], axis=1)
    
    # Define features
    features = [
        'since_last_5star',
        'guaranteed',
        'in_soft_pity',
        'pity_ratio'
    ] + banner_cols
    
    X = df[features]
    y = df['is_5star']
    
    # Train a simple Random Forest model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X, y)
    
    # Save the model, encoder and feature names
    model_data = {
        'model': model,
        'encoder': encoder,
        'feature_names': features
    }
    
    with open(output_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    logger.info(f"Base model created and saved to {output_path}")

if __name__ == "__main__":
    create_base_model()