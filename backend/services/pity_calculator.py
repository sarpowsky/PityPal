# Path: backend/services/pity_calculator.py
from datetime import datetime
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PityCalculator:
    def __init__(self):
        self.standard_5_stars = [
            "Diluc", "Jean", "Keqing", "Mona", "Qiqi", "Tighnari", "Dehya"
        ]
        self.banner_rules = {
            'character': {'soft_pity': 74, 'hard_pity': 90},
            'character-1': {'soft_pity': 74, 'hard_pity': 90},
            'character-2': {'soft_pity': 74, 'hard_pity': 90},
            'weapon': {'soft_pity': 63, 'hard_pity': 80},
            'permanent': {'soft_pity': 74, 'hard_pity': 90},
            'chronicled': {'soft_pity': 74, 'hard_pity': 90}
        }
        
    def _normalize_banner_type(self, banner_type):
        """Normalize banner types - treat all character banners as the same."""
        if banner_type.startswith('character-'):
            return 'character'
        return banner_type

    def calculate(self, wishes: Optional[List[Dict]] = None, banner_type: str = 'character') -> Dict:
        """Calculate pity statistics for a specific banner type"""
        if not wishes:
            return self._create_empty_stats(banner_type)
            
        # Normalize banner type
        banner_type = self._normalize_banner_type(banner_type)
            
        return self.calculate_banner_pity(wishes, banner_type)

    def calculate_all_banner_pities(self, wishes: List[Dict]) -> Dict:
        """Calculate pity for all banner types at once for consistency."""
        if not wishes:
            return {
                "character": self._create_empty_stats('character'),
                "weapon": self._create_empty_stats('weapon'),
                "permanent": self._create_empty_stats('permanent')
            }
            
        # Calculate each banner type
        character_pity = self.calculate(wishes, 'character')
        weapon_pity = self.calculate(wishes, 'weapon')
        permanent_pity = self.calculate(wishes, 'permanent')
        
        # Return dictionary with consistent naming
        return {
            "character": character_pity,
            "weapon": weapon_pity,
            "permanent": permanent_pity
        }

    def calculate_banner_pity(self, wishes: List[Dict], banner_type: str) -> Dict:
        # Normalize banner type
        banner_type = self._normalize_banner_type(banner_type)
        
        # Handle all character banners together
        if banner_type == 'character':
            banner_wishes = [w for w in wishes if w['bannerType'].startswith('character')]
        elif banner_type == 'permanent':
            banner_wishes = [w for w in wishes if w['bannerType'] == 'permanent']
        else:
            banner_wishes = [w for w in wishes if w['bannerType'] == banner_type]
            
        banner_wishes.sort(key=lambda x: x['time'], reverse=True)
        
        current_pity = 0
        guaranteed = False

        for wish in banner_wishes:
            current_pity += 1
            if wish['rarity'] == 5:
                # If they got a standard 5★, next is guaranteed
                if wish['name'] in self.standard_5_stars:
                    guaranteed = True
                else:
                    guaranteed = False
                break

        return self._create_pity_stats(current_pity, banner_type, guaranteed)

    def calculate_pull_counts(self, wishes: List[Dict]) -> List[Dict]:
        # Group wishes by pity sharing and pre-sort
        pity_groups = {}
        for wish in wishes:
            # Normalize banner type
            banner_type = self._normalize_banner_type(wish['bannerType'])
            
            if banner_type not in pity_groups:
                pity_groups[banner_type] = []
            pity_groups[banner_type].append(wish)

        # Process each group
        result_wishes = []
        for group_key, group_wishes in pity_groups.items():
            # Sort chronologically within group
            group_wishes.sort(key=lambda x: x['time'])
            
            pity_5 = 0
            pity_4 = 0
            
            for wish in group_wishes:
                wish = wish.copy()  # Create copy to avoid modifying original
                
                pity_5 += 1
                pity_4 += 1
                
                if wish['rarity'] == 5:
                    wish['pity'] = pity_5
                    pity_5 = 0
                elif wish['rarity'] == 4:
                    wish['pity'] = pity_4
                    pity_4 = 0
                else:
                    wish['pity'] = 0  # 3★ shows 0
                    
                result_wishes.append(wish)

        # Final sort by time for display
        return sorted(result_wishes, key=lambda x: x['time'], reverse=True)

    def calculate_stats(self, wishes: List[Dict]) -> Dict:
        if not wishes:
            return self._create_empty_stats('character')

        # Normalize banner types in the wish data
        normalized_wishes = []
        for wish in wishes:
            wish_copy = wish.copy()
            wish_copy['bannerType'] = self._normalize_banner_type(wish['bannerType'])
            normalized_wishes.append(wish_copy)

        banner_stats = {}
        for banner_type in set(w['bannerType'] for w in normalized_wishes):
            banner_wishes = [w for w in normalized_wishes if w['bannerType'] == banner_type]
            if banner_wishes:
                stats = {
                    'total': len(banner_wishes),
                    'five_stars': len([w for w in banner_wishes if w['rarity'] == 5]),
                    'four_stars': len([w for w in banner_wishes if w['rarity'] == 4]),
                    'average_pity': self._calculate_average_pity(banner_wishes)
                }
                banner_stats[banner_type] = stats

        return {
            'total_wishes': len(wishes),
            'banner_stats': banner_stats,
            'total_five_stars': len([w for w in wishes if w['rarity'] == 5]),
            'total_four_stars': len([w for w in wishes if w['rarity'] == 4])
        }

    def _calculate_average_pity(self, wishes: List[Dict]) -> float:
        pity_counts = []
        current_pity = 0
        
        for wish in sorted(wishes, key=lambda x: x['time']):
            current_pity += 1
            if wish['rarity'] == 5:
                pity_counts.append(current_pity)
                current_pity = 0

        return round(sum(pity_counts) / len(pity_counts), 1) if pity_counts else 0

    def _create_pity_stats(self, current_pity: int, banner_type: str, guaranteed: bool = False) -> Dict:
        # Normalize banner type
        banner_type = self._normalize_banner_type(banner_type)
        rules = self.banner_rules.get(banner_type, self.banner_rules['permanent'])
        
        # Determine pity type
        pity_type = None
        if current_pity >= rules['hard_pity']:
            pity_type = 'hard'
        elif current_pity >= rules['soft_pity']:
            pity_type = 'soft'

        # Calculate primogem estimates
        remaining_to_soft = max(0, rules['soft_pity'] - current_pity)
        remaining_to_hard = max(0, rules['hard_pity'] - current_pity)
        
        primogems_to_soft = remaining_to_soft * 160
        primogems_to_hard = remaining_to_hard * 160

        return {
            'current': current_pity,
            'pity_type': pity_type,
            'guaranteed': guaranteed,
            'wishes_to_soft': remaining_to_soft,
            'wishes_to_hard': remaining_to_hard,
            'primogems_to_soft': primogems_to_soft,
            'primogems_to_hard': primogems_to_hard,
            'thresholds': rules
        }

    def _create_empty_stats(self, banner_type: str) -> Dict:
        # Normalize banner type
        banner_type = self._normalize_banner_type(banner_type)
        rules = self.banner_rules.get(banner_type, self.banner_rules['permanent'])
        return {
            'current': 0,
            'pity_type': None,
            'guaranteed': False,
            'wishes_to_soft': rules['soft_pity'],
            'wishes_to_hard': rules['hard_pity'],
            'primogems_to_soft': rules['soft_pity'] * 160,
            'primogems_to_hard': rules['hard_pity'] * 160,
            'thresholds': rules
        }