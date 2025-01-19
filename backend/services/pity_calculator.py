# Path: backend/services/pity_calculator.py
from datetime import datetime
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PityCalculator:
    def __init__(self):
        self.cache: Dict[str, Dict] = {}
        self.banner_rules = {
            'character': {
                'guaranteed_pity': 90,
                'soft_pity_start': 74,
                'rate_increase': 0.32,  # per pull after soft pity
                'base_rate': 0.006
            },
            'weapon': {
                'guaranteed_pity': 80,
                'soft_pity_start': 63,
                'rate_increase': 0.35,
                'base_rate': 0.007
            }
        }
        self.pity_thresholds = {
            'character': {
                'soft': 74,
                'hard': 90
            },
            'weapon': {
                'soft': 63,
                'hard': 80
            }
        }

    def calculate(self, wishes: Optional[List[Dict]] = None, banner_type: str = 'character') -> Dict:
        """Calculate pity statistics for a specific banner type"""
        cache_key = f"{banner_type}_{len(wishes) if wishes else 0}"
        
        # Return cached result if available
        if cache_key in self.cache:
            return self.cache[cache_key]

        if not wishes:
            result = self._create_pity_stats(0, False, banner_type)
            self.cache[cache_key] = result
            return result

        try:
            # Filter wishes by banner type and sort by date
            banner_wishes = sorted(
                [w for w in wishes if w['bannerType'] == banner_type],
                key=lambda x: x['time'],
                reverse=True
            )

            if not banner_wishes:
                result = self._create_pity_stats(0, False, banner_type)
                self.cache[cache_key] = result
                return result

            # Count wishes since last 5-star
            current_pity = 0
            guaranteed = False
            featured_char = None
            pity_history = []

            for wish in banner_wishes:
                current_pity += 1
                
                if wish['rarity'] == 5:
                    pity_history.append(current_pity)
                    if banner_type == 'character':
                        if featured_char is None:
                            featured_char = wish['name']
                        elif wish['name'] != featured_char:
                            guaranteed = True
                    break

            result = self._create_pity_stats(current_pity, guaranteed, banner_type)
            result['pity_history'] = pity_history
            result['probability'] = self.get_pull_probability(current_pity, banner_type)
            
            self.cache[cache_key] = result
            return result

        except Exception as e:
            logger.error(f"Pity calculation failed: {e}")
            return self._create_pity_stats(0, False, banner_type)

    def _create_pity_stats(self, current_pity: int, guaranteed: bool, banner_type: str) -> Dict:
        """Create pity statistics object"""
        thresholds = self.pity_thresholds[banner_type]
        
        # Determine pity type
        pity_type = None
        if current_pity >= thresholds['hard']:
            pity_type = 'hard'
        elif current_pity >= thresholds['soft']:
            pity_type = 'soft'

        # Calculate wishes needed
        wishes_to_soft = max(0, thresholds['soft'] - current_pity)
        wishes_to_hard = max(0, thresholds['hard'] - current_pity)

        return {
            'current': current_pity,
            'since_last_5star': current_pity,
            'guaranteed': guaranteed,
            'pity_type': pity_type,
            'wishes_to_soft': wishes_to_soft,
            'wishes_to_hard': wishes_to_hard,
            'thresholds': thresholds,
            'probability': self.get_pull_probability(current_pity, banner_type)
        }

    def get_pull_probability(self, current_pity: int, banner_type: str) -> float:
        """Calculate probability of getting a 5-star on next pull"""
        rules = self.banner_rules[banner_type]
        
        if current_pity >= rules['guaranteed_pity']:
            return 1.0
        elif current_pity >= rules['soft_pity_start']:
            base_prob = rules['base_rate']
            increased_prob = (current_pity - rules['soft_pity_start']) * rules['rate_increase']
            return min(1.0, base_prob + increased_prob)
        return rules['base_rate']

    def calculate_stats(self, wishes: List[Dict]) -> Dict:
        """Calculate overall wishing statistics"""
        if not wishes:
            return self._create_empty_stats()

        try:
            total_wishes = len(wishes)
            five_stars = len([w for w in wishes if w['rarity'] == 5])
            four_stars = len([w for w in wishes if w['rarity'] == 4])
            primogems_spent = total_wishes * 160  # 160 primogems per wish

            # Calculate average pity and pity distribution
            pity_counts = []
            current_pity = 0
            
            for wish in sorted(wishes, key=lambda x: x['time']):
                current_pity += 1
                if wish['rarity'] == 5:
                    pity_counts.append(current_pity)
                    current_pity = 0

            avg_pity = sum(pity_counts) / len(pity_counts) if pity_counts else 0

            # Calculate banner-specific stats
            banner_stats = {}
            for banner_type in set(w['bannerType'] for w in wishes):
                banner_wishes = [w for w in wishes if w['bannerType'] == banner_type]
                banner_stats[banner_type] = {
                    'total': len(banner_wishes),
                    'five_stars': len([w for w in banner_wishes if w['rarity'] == 5]),
                    'four_stars': len([w for w in banner_wishes if w['rarity'] == 4])
                }

            return {
                'total_wishes': total_wishes,
                'five_stars': five_stars,
                'four_stars': four_stars,
                'primogems_spent': primogems_spent,
                'avg_pity': round(avg_pity, 1),
                'pity_counts': pity_counts,
                'banner_stats': banner_stats,
                'pity_distribution': self._calculate_pity_distribution(pity_counts)
            }

        except Exception as e:
            logger.error(f"Failed to calculate stats: {e}")
            return self._create_empty_stats()

    def _calculate_pity_distribution(self, pity_counts: List[int]) -> Dict:
        """Calculate distribution of pity counts"""
        if not pity_counts:
            return {}
            
        distribution = {
            'early': len([p for p in pity_counts if p <= 50]),
            'mid': len([p for p in pity_counts if 51 <= p <= 73]),
            'soft': len([p for p in pity_counts if 74 <= p <= 89]),
            'hard': len([p for p in pity_counts if p >= 90])
        }
        
        total = sum(distribution.values())
        return {
            'counts': distribution,
            'percentages': {
                k: round(v / total * 100, 1) if total > 0 else 0
                for k, v in distribution.items()
            }
        }

    def _create_empty_stats(self) -> Dict:
        """Create empty statistics object"""
        return {
            'total_wishes': 0,
            'five_stars': 0,
            'four_stars': 0,
            'primogems_spent': 0,
            'avg_pity': 0,
            'pity_counts': [],
            'banner_stats': {},
            'pity_distribution': self._calculate_pity_distribution([])
        }

    def clear_cache(self):
        """Clear calculation cache"""
        self.cache = {}
        logger.info("Pity calculation cache cleared")