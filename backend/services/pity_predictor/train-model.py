import json
import numpy as np
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import roc_auc_score, classification_report

def load_wish_data(file_path):
    """Load wish history data from a JSON file."""
    with open(file_path, 'r') as f:
        wishes = json.load(f)
    return wishes

def preprocess_wishes(wishes):
    """Preprocess wish data to calculate pity and create features."""
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
    
    # One-hot encode banner type
    try:
        # For newer scikit-learn versions
        encoder = OneHotEncoder(sparse=False, drop='first')
    except TypeError:
        try:
            # For scikit-learn 0.23+
            encoder = OneHotEncoder(sparse_output=False, drop='first')
        except TypeError:
            # For older scikit-learn versions
            encoder = OneHotEncoder(drop='first')
            # Note: with older versions, you'll need to convert sparse matrix later
    banner_encoded = encoder.fit_transform(processed_df[['bannerType']])
    banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
    banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=processed_df.index)
    
    # Combine features
    processed_df = pd.concat([processed_df, banner_df], axis=1)
    
    return processed_df, encoder

def train_random_forest(processed_df):
    """Train a Random Forest model on the processed wish data."""
    # Define features and target
    features = [
        'since_last_5star',
        'guaranteed',
        'in_soft_pity',
        'pity_ratio'
    ] + [col for col in processed_df.columns if col.startswith('banner_')]
    
    X = processed_df[features]
    y = processed_df['is_5star']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define parameter grid for hyperparameter tuning
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 20],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    # Initialize and train the model with GridSearchCV
    rf = RandomForestClassifier(random_state=42, class_weight='balanced')
    grid_search = GridSearchCV(rf, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    # Get best model
    best_model = grid_search.best_estimator_
    
    # Evaluate on test set
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]
    
    # Print evaluation metrics
    print("Model Evaluation:")
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Test ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'Feature': features,
        'Importance': best_model.feature_importances_
    }).sort_values('Importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance)
    
    return best_model, features

def save_model(model, encoder, feature_names, file_path='pretrained_model.pkl'):
    """Save the trained model, encoder, and feature names."""
    model_data = {
        'model': model,
        'encoder': encoder,
        'feature_names': feature_names
    }
    
    with open(file_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Model saved to {file_path}")

def main():
    # Load data
    wishes = load_wish_data('genshin_wishes_20250204_001352.json')
    
    # Preprocess data
    processed_df, encoder = preprocess_wishes(wishes)
    
    # Print dataset info
    print(f"Dataset size: {len(processed_df)} wishes")
    print(f"Number of 5-star pulls: {processed_df['is_5star'].sum()}")
    print(f"5-star rate: {processed_df['is_5star'].mean():.4f}")
    
    # Train model
    model, feature_names = train_random_forest(processed_df)
    
    # Save model
    save_model(model, encoder, feature_names)

if __name__ == "__main__":
    main()