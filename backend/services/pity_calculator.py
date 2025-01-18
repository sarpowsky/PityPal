# Path: backend/services/pity_calculator.py
from datetime import datetime

class PityCalculator:
    def __init__(self):
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

    def calculate(self, wishes=None, banner_type='character'):
        if not wishes:
            return {
                'current': 0,
                'since_last_5star': 0,
                'guaranteed': False,
                'pity_type': None,
                'wishes_to_soft': 0,
                'wishes_to_hard': 0
            }

        # Filter wishes by banner type and sort by date
        banner_wishes = sorted(
            [w for w in wishes if w['bannerType'] == banner_type],
            key=lambda x: x['time'],
            reverse=True
        )

        if not banner_wishes:
            return self._create_pity_stats(0, False, banner_type)

        # Count wishes since last 5-star
        current_pity = 0
        guaranteed = False
        featured_char = None

        for wish in banner_wishes:
            current_pity += 1
            
            if wish['rarity'] == 5:
                if banner_type == 'character':
                    if featured_char is None:
                        # Get featured character from first 5-star pull
                        featured_char = wish['name']
                    elif wish['name'] != featured_char:
                        # Lost 50/50, next is guaranteed
                        guaranteed = True
                break

        return self._create_pity_stats(current_pity, guaranteed, banner_type)

    def _create_pity_stats(self, current_pity, guaranteed, banner_type):
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
            'thresholds': thresholds
        }

    def calculate_stats(self, wishes):
        if not wishes:
            return self._create_empty_stats()

        total_wishes = len(wishes)
        five_stars = len([w for w in wishes if w['rarity'] == 5])
        four_stars = len([w for w in wishes if w['rarity'] == 4])
        primogems_spent = total_wishes * 160  # 160 primogems per wish

        # Calculate average pity
        pity_counts = []
        current_pity = 0
        for wish in sorted(wishes, key=lambda x: x['time']):
            current_pity += 1
            if wish['rarity'] == 5:
                pity_counts.append(current_pity)
                current_pity = 0

        avg_pity = sum(pity_counts) / len(pity_counts) if pity_counts else 0

        return {
            'total_wishes': total_wishes,
            'five_stars': five_stars,
            'four_stars': four_stars,
            'primogems_spent': primogems_spent,
            'avg_pity': round(avg_pity, 1),
            'pity_counts': pity_counts
        }

    def _create_empty_stats(self):
        return {
            'total_wishes': 0,
            'five_stars': 0,
            'four_stars': 0,
            'primogems_spent': 0,
            'avg_pity': 0,
            'pity_counts': []
        }