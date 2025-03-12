import json
import numpy as np
import pandas as pd
import pickle
import copy
from sklearn.ensemble import RandomForestClassifier
import argparse

def load_pretrained_model(file_path='pretrained_model.pkl'):
    """Load the pre-trained model, encoder, and feature names."""
    with open(file_path, 'rb') as f:
        model_data = pickle.load(f)
    return model_data['model'], model_data['encoder'], model_data['feature_names']

def preprocess_user_wishes(wishes, encoder):
    """Preprocess user wish data to calculate pity and create features."""
    # Convert to DataFrame
    df = pd.DataFrame(wishes)
    
    # Convert time to datetime
    df['time'] = pd.to_datetime(df['time'])
    
    # Sort by time
    df = df.sort_values('time')
    
    # Process each banner type separately
    banner_types = df['bannerType'].unique()
    all_processed = []
    
    for banner in banner_types:
        banner_df = df[df['bannerType'] == banner].copy()
        
        # Calculate pity for each pull
        banner_df['pity'] = 1
        banner_df['since_last_5star'] = 1
        banner_df['guaranteed'] = False
        
        pity_counter = 0
        guarantee = False
        
        # Standard characters (for 50/50 system)
        standard_characters = ["Diluc", "Jean", "Keqing", "Mona", "Qiqi", "Tighnari", "Dehya"]
        
        for i, (idx, row) in enumerate(banner_df.iterrows()):
            banner_df.at[idx, 'since_last_5star'] = pity_counter
            banner_df.at[idx, 'guaranteed'] = guarantee
            
            pity_counter += 1
            
            if row['rarity'] == 5:
                # Check if it was a standard character on character banner
                if banner.startswith('character') and row['name'] in standard_characters:
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
        processed_df['bannerType'].str.contains('weapon'),
        63,  # Weapon banner soft pity
        74   # Character banner soft pity
    )
    
    processed_df['hard_pity'] = np.where(
        processed_df['bannerType'].str.contains('weapon'),
        80,  # Weapon banner hard pity
        90   # Character banner hard pity
    )
    
    # Add features for pity zones
    processed_df['in_soft_pity'] = (processed_df['since_last_5star'] >= processed_df['soft_pity']).astype(int)
    processed_df['pity_ratio'] = processed_df['since_last_5star'] / processed_df['hard_pity']
    
    # Handle new banner types by making a copy of the encoder and refitting if needed
    user_banner_types = set(processed_df['bannerType'].unique())
    encoder_banner_types = set(encoder.categories_[0])
    
    if not user_banner_types.issubset(encoder_banner_types):
        print("Warning: New banner types detected in user data.")
        print(f"User banner types: {user_banner_types}")
        print(f"Model's known banner types: {encoder_banner_types}")
        print("Using only previously known banner types for fine-tuning.")
        
        # Filter out wishes from unknown banner types
        processed_df = processed_df[processed_df['bannerType'].isin(encoder_banner_types)].copy()
    
    # One-hot encode banner type using the encoder
    try:
        banner_encoded = encoder.transform(processed_df[['bannerType']])
        banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
        banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=processed_df.index)
        
        # Combine features
        processed_df = pd.concat([processed_df, banner_df], axis=1)
    except ValueError as e:
        print(f"Error encoding banner types: {e}")
        return None
    
    return processed_df

def fine_tune_model(model, processed_df, feature_names, weight_user_data=5):

    # Takes pre-trained model and updates it with user-specific pull data
    # Applies higher weights to 5★ pulls due to their rarity in the dataset
    # Weights user data higher than synthetic data to personalize predictions

    # Make a deep copy of the model to avoid modifying the original
    fine_tuned_model = copy.deepcopy(model)
    
    # Define features and target
    X = processed_df[feature_names]
    y = processed_df['is_5star']
    
    # Create sample weights to give more importance to user data
    sample_weight = np.ones(len(y)) * weight_user_data
    
    # Give more weight to 5-star pulls (they're rare)
    five_star_weight = 10.0  # Even more weight for 5-star pulls
    sample_weight[y == 1] *= five_star_weight
    
    # Fine-tune the model
    fine_tuned_model.fit(X, y, sample_weight=sample_weight)
    
    # Print some stats
    print(f"Fine-tuned model with {len(processed_df)} user wishes")
    print(f"Number of 5-star pulls in user data: {y.sum()}")
    print(f"5-star rate in user data: {y.mean():.4f}")
    
    return fine_tuned_model

def save_fine_tuned_model(model, encoder, feature_names, file_path='fine_tuned_model.pkl'):
    """Save the fine-tuned model, encoder, and feature names."""
    model_data = {
        'model': model,
        'encoder': encoder,
        'feature_names': feature_names
    }
    
    with open(file_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Fine-tuned model saved to {file_path}")

def main():
    parser = argparse.ArgumentParser(description='Fine-tune a pre-trained Genshin Impact wish prediction model with user data')
    parser.add_argument('user_data_file', help='Path to user wish history JSON file')
    parser.add_argument('-o', '--output', default='fine_tuned_model.pkl', help='Output file path for fine-tuned model')
    parser.add_argument('-p', '--pretrained', default='pretrained_model.pkl', help='Path to pre-trained model file')
    parser.add_argument('-w', '--weight', type=float, default=5.0, help='Weight to give to user data (higher = more user-specific)')
    
    args = parser.parse_args()
    
    # Load pre-trained model
    model, encoder, feature_names = load_pretrained_model(args.pretrained)
    
    # Load user data
    with open(args.user_data_file, 'r') as f:
        user_wishes = json.load(f)
    
    # Preprocess user data
    processed_user_df = preprocess_user_wishes(user_wishes, encoder)
    
    if processed_user_df is None or len(processed_user_df) == 0:
        print("Error: No valid wishes to train on after preprocessing")
        return
    
    # Fine-tune model
    fine_tuned_model = fine_tune_model(model, processed_user_df, feature_names, weight_user_data=args.weight)
    
    # Save fine-tuned model
    save_fine_tuned_model(fine_tuned_model, encoder, feature_names, args.output)

if __name__ == "__main__":
    main()