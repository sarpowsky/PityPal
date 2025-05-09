# Path: backend/services/pity_predictor/predict.py
import numpy as np
import pandas as pd
import pickle
import argparse
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.colors import LinearSegmentedColormap

def load_model(file_path='fine_tuned_model.pkl'):
    """Load the fine-tuned model, encoder, and feature names."""
    with open(file_path, 'rb') as f:
        model_data = pickle.load(f)
    return model_data['model'], model_data['encoder'], model_data['feature_names']

def get_pity_thresholds(banner_type):
    """Get soft and hard pity thresholds for a banner type."""
    # Normalize character banner types
    if banner_type.startswith('character-'):
        banner_type = 'character'
        
    if banner_type == 'weapon':
        return {'soft_pity': 63, 'hard_pity': 80}
    else:
        # All character banners (character, character-1, character-2, permanent) 
        # use the same pity thresholds
        return {'soft_pity': 74, 'hard_pity': 90}

def predict_next_pulls(current_pity, banner_type, guaranteed=False, n_pulls=40, model_file='fine_tuned_model.pkl'):
    """
    Predict the probability of getting a 5-star in the next n pulls with enhanced piecewise estimation.
    
    Args:
        current_pity: Current pity count (pulls since last 5-star)
        banner_type: Type of banner (character, character-1, character-2, weapon, permanent)
        guaranteed: Whether the next 5-star is guaranteed to be the featured one
        n_pulls: Number of future pulls to predict
        model_file: Path to the fine-tuned model file
    
    Returns:
        probabilities: Array of probabilities for each of the next n pulls
    """
    # Handle UI-level "character" banner type for model compatibility
    if banner_type == 'character':
        banner_type = 'character-1'  # Use character-1 for model compatibility
    # Normalize character-2 for UI display but keep it as is for model
    elif banner_type.startswith('character-'):
        pass  # Keep as is for model compatibility
        
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
        
        # Add enhanced piecewise probability features
        near_soft_pity = (pull_pity >= thresholds['soft_pity'] - 5) and (pull_pity < thresholds['soft_pity'])
        mid_soft_pity = (pull_pity >= thresholds['soft_pity']) and (pull_pity < thresholds['soft_pity'] + 5)
        late_soft_pity = (pull_pity >= thresholds['soft_pity'] + 5) and (pull_pity < thresholds['hard_pity'])
        near_hard_pity = (pull_pity >= thresholds['hard_pity'] - 3)
        
        features['near_soft_pity'] = [1 if near_soft_pity else 0]
        features['mid_soft_pity'] = [1 if mid_soft_pity else 0]
        features['late_soft_pity'] = [1 if late_soft_pity else 0]
        features['near_hard_pity'] = [1 if near_hard_pity else 0]
        
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
            # Filter to include only features the model knows about
            known_features = [f for f in feature_names if f in df.columns]
            missing_features = [f for f in feature_names if f not in df.columns]
            
            if missing_features:
                # Create columns for missing features with default values
                for f in missing_features:
                    df[f] = 0
            
            X = df[feature_names]
            
            # Get the model prediction
            prob = model.predict_proba(X)[0][1]  # Probability of class 1 (5-star)
            
            # Enhanced piecewise probability model
            # Apply a more sophisticated piecewise model based on pity zones
            if pull_pity >= thresholds['soft_pity']:
                # Calculate progress within soft pity zone
                progress_in_soft_pity = (pull_pity - thresholds['soft_pity']) / (thresholds['hard_pity'] - thresholds['soft_pity'])
                
                # Base boost factor
                boost_factor = 1.0
                
                if progress_in_soft_pity < 0.33:
                    # Early soft pity (first third) - moderate boost
                    boost_factor = 1.5 + progress_in_soft_pity * 3.0
                elif progress_in_soft_pity < 0.66:
                    # Mid soft pity (second third) - stronger boost
                    boost_factor = 2.5 + progress_in_soft_pity * 3.0
                else:
                    # Late soft pity (final third) - strongest boost
                    boost_factor = 3.5 + progress_in_soft_pity * 6.0
                
                # Apply boost with smoothing to ensure no probability jumps
                prob = min(0.99, prob * boost_factor)
                
                # Special case for very near hard pity (last 2-3 pulls)
                if pull_pity >= thresholds['hard_pity'] - 3:
                    remaining = thresholds['hard_pity'] - pull_pity
                    if remaining == 1:
                        prob = min(0.99, prob * 1.8)  # Very high chance on pull before hard pity
                    elif remaining == 2:
                        prob = min(0.95, prob * 1.5)  # Higher chance two pulls before hard pity
            
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
    # Normalize character banner types
    if banner_type.startswith('character-'):
        banner_type = 'character'
        
    # Adjust x-axis to show total pity
    x_values = [current_pity + i + 1 for i in range(len(probabilities))]
    
    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Get pity thresholds for this banner type
    thresholds = get_pity_thresholds(banner_type)
    
    # Create custom colormaps for better visuals
    bar_colors = []
    for i, x_val in enumerate(x_values):
        if x_val >= thresholds['hard_pity']:
            bar_colors.append('#E15759')  # Red for hard pity
        elif x_val >= thresholds['soft_pity']:
            # Gradient from teal to red as we approach hard pity
            progress = (x_val - thresholds['soft_pity']) / (thresholds['hard_pity'] - thresholds['soft_pity'])
            r = int(118 + progress * (225 - 118))  # Transition from 76B7B2 to E15759
            g = int(183 - progress * (183 - 87))
            b = int(178 - progress * (178 - 89))
            bar_colors.append(f'#{r:02x}{g:02x}{b:02x}')
        else:
            bar_colors.append('#4E79A7')  # Blue for base rate
    
    # Plot individual pull probabilities with gradient colors
    bars = ax1.bar(x_values, probabilities, alpha=0.8, color=bar_colors)
    
    ax1.set_title('Probability of 5★ for Each Pull', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Pity Count', fontsize=12)
    ax1.set_ylabel('Probability', fontsize=12)
    ax1.grid(True, alpha=0.3)
    
    # Add threshold lines
    ax1.axvline(x=thresholds['soft_pity'], color='#F28E2B', linestyle='--', 
                linewidth=2, label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax1.axvline(x=thresholds['hard_pity'], color='#E15759', linestyle='--', 
                linewidth=2, label=f'Hard Pity ({thresholds["hard_pity"]})')
    
    # Add shaded regions for pity zones with more vibrant colors
    ax1.axvspan(0, thresholds['soft_pity'], alpha=0.1, color='#4E79A7', 
               label=f'Base Rate Zone')
    ax1.axvspan(thresholds['soft_pity'], thresholds['hard_pity'], alpha=0.15, color='#76B7B2', 
                label=f'Soft Pity Zone')
    ax1.axvspan(thresholds['hard_pity'], max(x_values) + 1, alpha=0.15, color='#E15759', 
                label=f'Hard Pity Zone')
    
    ax1.legend(loc='upper left')
    
    # Plot cumulative probability with enhanced styling
    line_cmap = LinearSegmentedColormap.from_list('greenline', [(0, '#59A14F'), (1, '#ff9500')])
    points_x = x_values
    points_y = cumulative_probs
    points_colors = [line_cmap(y) for y in points_y]
    
    # Add gradient line and points for cumulative probability
    for i in range(len(points_x) - 1):
        ax2.plot([points_x[i], points_x[i+1]], [points_y[i], points_y[i+1]], 
                color=line_cmap(points_y[i]), linewidth=3)
    
    # Add markers with consistent styling
    for i, (x, y) in enumerate(zip(points_x, points_y)):
        ax2.scatter(x, y, color=points_colors[i], s=60, zorder=5, 
                   edgecolor='white', linewidth=1)
    
    ax2.set_title('Cumulative Probability of Getting 5★', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Pity Count', fontsize=12)
    ax2.set_ylabel('Probability', fontsize=12)
    ax2.grid(True, alpha=0.3)
    
    # Add threshold lines to cumulative plot too
    ax2.axvline(x=thresholds['soft_pity'], color='#F28E2B', linestyle='--', 
                linewidth=2, label=f'Soft Pity ({thresholds["soft_pity"]})')
    ax2.axvline(x=thresholds['hard_pity'], color='#E15759', linestyle='--', 
                linewidth=2, label=f'Hard Pity ({thresholds["hard_pity"]})')
    
    # Add 50% and 95% probability lines with improved styling
    ax2.axhline(y=0.5, color='#8d62a9', linestyle='--', linewidth=2)
    ax2.axhline(y=0.9, color='#59A14F', linestyle='--', linewidth=2)
    
    # Add text labels for 50% and 90% lines
    ax2.text(x_values[0] + 1, 0.51, '50% Chance', color='#8d62a9', fontweight='bold')
    ax2.text(x_values[0] + 1, 0.91, '90% Chance', color='#59A14F', fontweight='bold')
    
    # Add shaded confidence region
    pull_50 = next((i for i, p in enumerate(cumulative_probs) if p >= 0.5), None)
    pull_90 = next((i for i, p in enumerate(cumulative_probs) if p >= 0.9), None)
    
    if pull_50 is not None and pull_90 is not None:
        # More visually appealing confidence interval
        confidence_region_x = [x_values[pull_50]]
        confidence_region_width = max(x_values[pull_90] - x_values[pull_50], 1)
        
        # Create a rectangle for confidence interval with rounded corners
        rect = patches.Rectangle(
            (confidence_region_x[0] - confidence_region_width/2, 0), 
            confidence_region_width, 1.0,
            alpha=0.15, color='#8d62a9', zorder=0,
            linewidth=1, linestyle='--', edgecolor='#8d62a9'
        )
        ax2.add_patch(rect)
        
        # Add confidence interval annotation
        ax2.annotate(
            f'±{confidence_region_width//2} pulls confidence',
            xy=(x_values[pull_50], 0.5),
            xytext=(x_values[pull_50], 0.35),
            arrowprops=dict(arrowstyle='->', color='#8d62a9', alpha=0.7),
            bbox=dict(boxstyle="round,pad=0.3", fc="#f0f0f0", alpha=0.8),
            ha='center',
            color='#8d62a9'
        )
    
    # Find the pulls for 50% and 90% probability
    pull_50_index = next((i for i, p in enumerate(cumulative_probs) if p >= 0.5), None)
    pull_90_index = next((i for i, p in enumerate(cumulative_probs) if p >= 0.9), None)
    
    # Highlight the 50% and 90% points with improved styling
    if pull_50_index is not None:
        pull_50_value = x_values[pull_50_index]
        marker_50 = ax2.scatter(pull_50_value, 0.5, s=120, color='#8d62a9', zorder=10, 
                              marker='o', edgecolor='white', linewidth=2)
        
        # Add a more visually appealing annotation
        ax2.annotate(
            f'50% at pull {pull_50_value}',
            xy=(pull_50_value, 0.5),
            xytext=(pull_50_value + 2, 0.6),
            arrowprops=dict(
                arrowstyle='->',
                connectionstyle="arc3,rad=.2",
                color='#8d62a9',
                alpha=0.7
            ),
            bbox=dict(
                boxstyle="round,pad=0.3",
                fc="#f0f0f0",
                alpha=0.8,
                edgecolor='#8d62a9',
                linewidth=1
            ),
            fontweight='bold'
        )
    
    if pull_90_index is not None:
        pull_90_value = x_values[pull_90_index]
        marker_90 = ax2.scatter(pull_90_value, 0.9, s=120, color='#59A14F', zorder=10, 
                              marker='o', edgecolor='white', linewidth=2)
        
        # Add a more visually appealing annotation
        ax2.annotate(
            f'90% at pull {pull_90_value}',
            xy=(pull_90_value, 0.9),
            xytext=(pull_90_value - 2, 0.8),
            arrowprops=dict(
                arrowstyle='->',
                connectionstyle="arc3,rad=-.2",
                color='#59A14F',
                alpha=0.7
            ),
            bbox=dict(
                boxstyle="round,pad=0.3",
                fc="#f0f0f0",
                alpha=0.8,
                edgecolor='#59A14F',
                linewidth=1
            ),
            fontweight='bold'
        )
    
    # Set title with pity and guarantee info
    guaranteed_text = "Guaranteed featured 5★" if guaranteed else "50/50 chance for featured 5★"
    banner_name = {
        'character': 'Character Event',
        'weapon': 'Weapon',
        'permanent': 'Standard',
        'chronicled': 'Chronicled'
    }.get(banner_type, banner_type)
    
    fig.suptitle(f'5★ Prediction for {banner_name} Banner\nCurrent Pity: {current_pity} - {guaranteed_text}', 
                fontsize=16, fontweight='bold')
    
    plt.tight_layout(rect=[0, 0, 1, 0.95])  # Adjust for the suptitle
    
    return fig

def save_plot(fig, filename='wish_prediction.png'):
    """Save the probability plot to a file."""
    fig.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Plot saved to {filename}")

def main():
    parser = argparse.ArgumentParser(description='Predict 5-star probabilities in Genshin Impact wishes')
    parser.add_argument('--pity', type=int, required=True, help='Current pity count')
    parser.add_argument('--banner', type=str, required=True, choices=['character', 'character-1', 'character-2', 'weapon', 'permanent'], 
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