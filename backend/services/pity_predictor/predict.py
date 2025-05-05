# Path: backend/services/pity_predictor/predict.py
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
        # All character banners (character-1, character-2, permanent) 
        # use the same pity thresholds
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
    
    # Limit prediction range to not exceed hard pity
    remaining_to_hard_pity = max(0, thresholds['hard_pity'] - current_pity)
    n_pulls = min(n_pulls, remaining_to_hard_pity)
    
    # Prepare feature data for prediction
    probabilities = []
    
    # For each potential future pull
    for i in range(n_pulls):
        pull_pity = current_pity + i
        
        # If we're at or beyond hard pity, it's 100%
        if pull_pity >= thresholds['hard_pity']:
            probabilities.append(1.0)
            continue
        
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
        
        try:
            # One-hot encode banner type
            banner_encoded = encoder.transform(df[['bannerType']])
            banner_cols = [f'banner_{cat}' for cat in encoder.get_feature_names_out(['bannerType'])]
            banner_df = pd.DataFrame(banner_encoded, columns=banner_cols, index=df.index)
            
            # Combine features
            df = pd.concat([df, banner_df], axis=1)
            
            # Select only the features used by the model
            X = df[feature_names]
            
            # Get the model prediction
            prob = model.predict_proba(X)[0][1]  # Probability of class 1 (5-star)
            
            # Enhance soft pity zone accuracy
            if pull_pity >= thresholds['soft_pity']:
                # Apply a more aggressive soft pity effect
                # The closer to hard pity, the more we boost the probability
                progress_in_soft_pity = (pull_pity - thresholds['soft_pity']) / (thresholds['hard_pity'] - thresholds['soft_pity'])
                
                # Use a sigmoid-like function to smooth the transition
                boost_factor = 1.0 + 2.0 * progress_in_soft_pity
                prob = min(0.99, prob * boost_factor)  # Cap at 99% to maintain uncertainty
            
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
    """Plot the pull probabilities and cumulative probability with enhanced visuals."""
    # Adjust x-axis to show total pity
    x_values = [current_pity + i + 1 for i in range(len(probabilities))]
    
    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Get pity thresholds for this banner type
    thresholds = get_pity_thresholds(banner_type)
    
    # Plot individual pull probabilities
    bars = ax1.bar(x_values, probabilities, alpha=0.7, color='#4E79A7')  # Blue color
    
    # Color the bars differently in soft pity zone
    for i, bar in enumerate(bars):
        pull_pity = current_pity + i + 1
        if pull_pity >= thresholds['hard_pity']:
            bar.set_color('#E15759')  # Red for hard pity
        elif pull_pity >= thresholds['soft_pity']:
            bar.set_color('#76B7B2')  # Teal for soft pity
    
    ax1.set_title('Probability of 5★ for Each Pull', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Pity Count', fontsize=12)
    ax1.set_ylabel('Probability', fontsize=12)
    ax1.grid(True, alpha=0.3)
    
    # Add threshold lines
    ax1.axvline(x=thresholds['soft_pity'], color='#F28E2B', linestyle='--', 
                linewidth=2, label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax1.axvline(x=thresholds['hard_pity'], color='#E15759', linestyle='--', 
                linewidth=2, label=f'Hard Pity ({thresholds["hard_pity"]})')
    
    # Add shaded regions for pity zones
    ax1.axvspan(thresholds['soft_pity'], thresholds['hard_pity'], alpha=0.15, color='#76B7B2', 
                label=f'Soft Pity Zone')
    ax1.axvspan(thresholds['hard_pity'], max(x_values) + 1, alpha=0.15, color='#E15759', 
                label=f'Hard Pity Zone')
    
    ax1.legend(loc='upper left')
    
    # Plot cumulative probability
    ax2.plot(x_values, cumulative_probs, marker='o', linestyle='-', color='#59A14F', 
             linewidth=3, markersize=6)  # Green color
    
    ax2.set_title('Cumulative Probability of Getting 5★', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Pity Count', fontsize=12)
    ax2.set_ylabel('Probability', fontsize=12)
    ax2.grid(True, alpha=0.3)
    
    # Add threshold lines to cumulative plot too
    ax2.axvline(x=thresholds['soft_pity'], color='#F28E2B', linestyle='--', 
                linewidth=2, label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax2.axvline(x=thresholds['hard_pity'], color='#E15759', linestyle='--', 
                linewidth=2, label=f'Hard Pity ({thresholds["hard_pity"]})')
    
    # Add 50% and 95% probability lines with clear labels
    ax2.axhline(y=0.5, color='#8d62a9', linestyle='--', linewidth=2, label='50% Chance')
    ax2.axhline(y=0.95, color='#59A14F', linestyle='--', linewidth=2, label='95% Chance')
    
    # Add shaded confidence region
    pull_50 = next((i for i, p in enumerate(cumulative_probs) if p >= 0.5), None)
    pull_95 = next((i for i, p in enumerate(cumulative_probs) if p >= 0.95), None)
    
    if pull_50 is not None and pull_95 is not None:
        range_value = max(pull_95 - pull_50, 1)  # Ensure at least 1
        ax2.axvspan(
            x_values[pull_50] - range_value, x_values[pull_50] + range_value, 
            alpha=0.15, color='#8d62a9', zorder=0
        )
        
        # Add annotation for the confidence interval
        ax2.annotate(
            f'±{range_value} pulls confidence interval',
            xy=(x_values[pull_50], 0.5),
            xytext=(x_values[pull_50], 0.4),
            arrowprops=dict(arrowstyle='->'),
            bbox=dict(boxstyle="round,pad=0.3", fc="#f0f0f0", alpha=0.8),
            ha='center'
        )
    
    ax2.legend(loc='upper left')
    
    # Set title with pity and guarantee info
    guaranteed_text = "Guaranteed featured 5★" if guaranteed else "50/50 chance for featured 5★"
    fig.suptitle(f'5★ Prediction for {banner_type} Banner\nCurrent Pity: {current_pity} - {guaranteed_text}', 
                fontsize=16, fontweight='bold')
    
    # Find the pulls for 50% and 95% probability
    pull_50_index = next((i for i, p in enumerate(cumulative_probs) if p >= 0.5), None)
    pull_95_index = next((i for i, p in enumerate(cumulative_probs) if p >= 0.95), None)
    
    if pull_50_index is not None:
        pull_50_value = x_values[pull_50_index]
        ax2.annotate(
            f'50% at pull {pull_50_value}',
            xy=(pull_50_value, 0.5),
            xytext=(pull_50_value + 2, 0.55),
            arrowprops=dict(arrowstyle='->'),
            bbox=dict(boxstyle="round,pad=0.3", fc="#f0f0f0", alpha=0.8)
        )
    
    if pull_95_index is not None:
        pull_95_value = x_values[pull_95_index]
        ax2.annotate(
            f'95% at pull {pull_95_value}',
            xy=(pull_95_value, 0.95),
            xytext=(pull_95_value - 2, 0.85),
            arrowprops=dict(arrowstyle='->'),
            bbox=dict(boxstyle="round,pad=0.3", fc="#f0f0f0", alpha=0.8)
        )
    
    plt.tight_layout(rect=[0, 0, 1, 0.95])  # Adjust for the suptitle
    
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