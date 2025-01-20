# Path: backend/services/pity_calculator.py
from datetime import datetime
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PityCalculator:
    def __init__(self):
        self.banner_rules = {
            'character-1': {'soft_pity': 74, 'hard_pity': 90},
            'character-2': {'soft_pity': 74, 'hard_pity': 90},
            'weapon': {'soft_pity': 63, 'hard_pity': 80},
            'permanent': {'soft_pity': 74, 'hard_pity': 90},
            'chronicled': {'soft_pity': 74, 'hard_pity': 90}
        }

    def calculate(self, wishes: Optional[List[Dict]] = None, banner_type: str = 'character-1') -> Dict:
        """Calculate pity statistics for a specific banner type"""
        if not wishes:
            return self._create_empty_stats(banner_type)
            
        # For character banners, combine both banner types
        if banner_type.startswith('character'):
            banner_type = 'character-1'
            
        return self.calculate_banner_pity(wishes, banner_type)

    def calculate_banner_pity(self, wishes: List[Dict], banner_type: str) -> Dict:
        # For character banners, combine both banners' wishes
        if banner_type.startswith('character'):
            banner_wishes = [w for w in wishes if w['bannerType'].startswith('character')]
        else:
            banner_wishes = [w for w in wishes if w['bannerType'] == banner_type]
            
        banner_wishes.sort(key=lambda x: x['time'], reverse=True)
        
        current_pity = 0
        for wish in banner_wishes:
            current_pity += 1
            if wish['rarity'] == 5:
                break

        return self._create_pity_stats(current_pity, banner_type)

    def calculate_pull_counts(self, wishes: List[Dict]) -> List[Dict]:
        # Group wishes by pity sharing and pre-sort
        pity_groups = {}
        for wish in wishes:
            # Character banners share pity
            group_key = 'character' if wish['bannerType'].startswith('character') else wish['bannerType']
            if group_key not in pity_groups:
                pity_groups[group_key] = []
            pity_groups[group_key].append(wish)

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
            return self._create_empty_stats('character-1')

        banner_stats = {}
        for banner_type in self.banner_rules.keys():
            banner_wishes = [w for w in wishes if w['bannerType'] == banner_type]
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
        rules = self.banner_rules.get(banner_type, self.banner_rules['permanent'])
        
        # Determine pity type
        pity_type = None
        if current_pity >= rules['hard_pity']:
            pity_type = 'hard'
        elif current_pity >= rules['soft_pity']:
            pity_type = 'soft'

        return {
            'current': current_pity,
            'pity_type': pity_type,
            'guaranteed': guaranteed,
            'wishes_to_soft': max(0, rules['soft_pity'] - current_pity),
            'wishes_to_hard': max(0, rules['hard_pity'] - current_pity),
            'thresholds': rules
        }

    def _create_empty_stats(self, banner_type: str) -> Dict:
        rules = self.banner_rules.get(banner_type, self.banner_rules['permanent'])
        return {
            'current': 0,
            'pity_type': None,
            'guaranteed': False,
            'wishes_to_soft': rules['soft_pity'],
            'wishes_to_hard': rules['hard_pity'],
            'thresholds': rules
        }