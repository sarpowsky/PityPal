import numpy as np
import pandas as pd
import pickle
import argparse
import matplotlib.pyplot as plt

def load_model(file_path='fine_tuned_model.pkl'):
    """Load the fine-tuned model, encoder, and feature names."""
    with open(file_path, 'rb') as f:
        model_data = pickle.load(f)
    return model_data['model'], model_data['encoder'], model_data['feature_names']

def get_pity_thresholds(banner_type):
    """Get soft and hard pity thresholds for a banner type."""
    if 'weapon' in banner_type:
        return {'soft_pity': 63, 'hard_pity': 80}
    else:
        return {'soft_pity': 74, 'hard_pity': 90}

def predict_next_pulls(current_pity, banner_type, guaranteed=False, n_pulls=40, model_file='fine_tuned_model.pkl'):
    """
    Predict the probability of getting a 5-star in the next n pulls.
    
    Args:
        current_pity: Current pity count (pulls since last 5-star)
        banner_type: Type of banner (character-1, character-2, weapon, permanent)
        guaranteed: Whether the next 5-star is guaranteed to be the featured one
        n_pulls: Number of future pulls to predict
        model_file: Path to the fine-tuned model file
    
    Returns:
        probabilities: Array of probabilities for each of the next n pulls
    """
    # Load model
    model, encoder, feature_names = load_model(model_file)
    
    # Get pity thresholds for this banner type
    thresholds = get_pity_thresholds(banner_type)
    
    # Prepare feature data for prediction
    probabilities = []
    
    # For each potential future pull
    for i in range(n_pulls):
        pull_pity = current_pity + i
        
        # Create a single row of features
        features = {
            'since_last_5star': [pull_pity],
            'guaranteed': [guaranteed],
            'in_soft_pity': [1 if pull_pity >= thresholds['soft_pity'] else 0],
            'pity_ratio': [pull_pity / thresholds['hard_pity']]
        }
        
        # Create DataFrame
        df = pd.DataFrame(features)
        
        # Add banner type for encoding
        df['bannerType'] = banner_type
        
        # One-hot encode banner type
        try:
            banner_encoded = encoder.transform(df[['bannerType']])
            banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
            banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=df.index)
            
            # Combine features
            df = pd.concat([df, banner_df], axis=1)
            
            # Select only the features used by the model
            X = df[feature_names]
            
            # Apply hard pity rule (100% at hard pity)
            if pull_pity >= thresholds['hard_pity']:
                prob = 1.0
            else:
                # Predict probability
                prob = model.predict_proba(X)[0][1]  # Probability of class 1 (5-star)
            
            probabilities.append(prob)
        except Exception as e:
            print(f"Error predicting for pull {i+1}: {e}")
            probabilities.append(0.0)  # Default to 0 on error
    
    return probabilities

def calculate_cumulative_probability(probabilities):
    """
    Calculate the cumulative probability of getting a 5-star within n pulls.
    
    Args:
        probabilities: Array of probabilities for each pull
    
    Returns:
        cumulative_probs: Array of cumulative probabilities
    """
    # Calculate cumulative probability (1 - probability of not getting a 5-star in any pull)
    cumulative_probs = [0]
    
    for i, prob in enumerate(probabilities):
        cumulative_probs.append(1 - (1 - cumulative_probs[i]) * (1 - prob))
    
    return cumulative_probs[1:]  # Skip the initial 0

def plot_probabilities(probabilities, cumulative_probs, current_pity, banner_type, guaranteed):
    """Plot the pull probabilities and cumulative probability."""
    # Adjust x-axis to show total pity
    x_values = [current_pity + i + 1 for i in range(len(probabilities))]
    
    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Plot individual pull probabilities
    ax1.bar(x_values, probabilities, alpha=0.7, color='skyblue')
    ax1.set_title('Probability of 5★ for Each Pull')
    ax1.set_xlabel('Pity Count')
    ax1.set_ylabel('Probability')
    ax1.grid(True, alpha=0.3)
    
    # Add threshold lines
    thresholds = get_pity_thresholds(banner_type)
    ax1.axvline(x=thresholds['soft_pity'], color='orange', linestyle='--', label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax1.axvline(x=thresholds['hard_pity'], color='red', linestyle='--', label=f'Hard Pity ({thresholds["hard_pity"]})')
    ax1.legend()
    
    # Plot cumulative probability
    ax2.plot(x_values, cumulative_probs, marker='o', linestyle='-', color='green')
    ax2.set_title('Cumulative Probability of Getting 5★')
    ax2.set_xlabel('Pity Count')
    ax2.set_ylabel('Probability')
    ax2.grid(True, alpha=0.3)
    
    # Add threshold lines to cumulative plot too
    ax2.axvline(x=thresholds['soft_pity'], color='orange', linestyle='--', label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax2.axvline(x=thresholds['hard_pity'], color='red', linestyle='--', label=f'Hard Pity ({thresholds["hard_pity"]})')
    
    # Add 50% and 95% probability lines
    ax2.axhline(y=0.5, color='purple', linestyle='--', label='50% Chance')
    ax2.axhline(y=0.95, color='darkgreen', linestyle='--', label='95% Chance')
    ax2.legend()
    
    # Set title with pity and guarantee info
    guaranteed_text = "Guaranteed featured 5★" if guaranteed else "50/50 chance for featured 5★"
    fig.suptitle(f'5★ Prediction for {banner_type} Banner\nCurrent Pity: {current_pity} - {guaranteed_text}', fontsize=14)
    
    plt.tight_layout()
    return fig

def save_plot(fig, filename='wish_prediction.png'):
    """Save the probability plot to a file."""
    fig.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Plot saved to {filename}")

def main():
    parser = argparse.ArgumentParser(description='Predict 5-star probabilities in Genshin Impact wishes')
    parser.add_argument('--pity', type=int, required=True, help='Current pity count')
    parser.add_argument('--banner', type=str, required=True, choices=['character-1', 'character-2', 'weapon', 'permanent'], 
                        help='Banner type')
    parser.add_argument('--guaranteed', action='store_true', help='Whether the next 5-star is guaranteed to be featured')
    parser.add_argument('--pulls', type=int, default=40, help='Number of future pulls to predict')
    parser.add_argument('--model', type=str, default='fine_tuned_model.pkl', help='Path to model file')
    parser.add_argument('--plot', type=str, default=None, help='Save plot to this file')
    
    args = parser.parse_args()
    
    # Predict probabilities
    probabilities = predict_next_pulls(
        args.pity, args.banner, args.guaranteed, args.pulls, args.model
    )
    
    # Calculate cumulative probability
    cumulative_probs = calculate_cumulative_probability(probabilities)
    
    # Print results
    print(f"\nPredictions for {args.banner} banner with current pity {args.pity} ({'Guaranteed' if args.guaranteed else '50/50'}):")
    print("\nProbability of getting a 5★ in each pull:")
    
    # Print in a nice table format with pity count
    print(f"{'Pity':<6}{'Probability':<12}{'Cumulative':<12}")
    print(f"{'----':<6}{'----------':<12}{'----------':<12}")
    
    for i, (prob, cum_prob) in enumerate(zip(probabilities, cumulative_probs)):
        pity = args.pity + i + 1
        print(f"{pity:<6}{prob*100:.2f}%{' '*8}{cum_prob*100:.2f}%")
    
    # Generate plot
    fig = plot_probabilities(probabilities, cumulative_probs, args.pity, args.banner, args.guaranteed)
    
    # Save plot if requested
    if args.plot:
        save_plot(fig, args.plot)
    else:
        plt.show()

if __name__ == "__main__":
    main()