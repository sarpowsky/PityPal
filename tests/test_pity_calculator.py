# tests/test_pity_calculator.py
import pytest
from backend.services.pity_calculator import PityCalculator

class TestPityCalculator:
    @pytest.fixture
    def calculator(self):
        return PityCalculator()
    
    @pytest.fixture
    def mock_wishes(self):
        # Create test data mimicking wish history
        return [
            {"id": "1", "name": "Test Character", "rarity": 5, "type": "Character", 
             "time": "2025-01-01 12:00:00", "bannerType": "character-1"},
            {"id": "2", "name": "Test Weapon", "rarity": 4, "type": "Weapon", 
             "time": "2025-01-01 12:01:00", "bannerType": "character-1"},
            # Add more test wishes as needed
        ]
    
    def test_calculate_empty_wishes(self, calculator):
        """Test calculation with empty wish list."""
        result = calculator.calculate(None, 'character-1')
        assert result['current'] == 0
        assert result['guaranteed'] is False
    
    def test_calculate_pity(self, calculator, mock_wishes):
        """Test pity calculation with sample wishes."""
        result = calculator.calculate(mock_wishes, 'character-1')
        assert result['current'] >= 0
        assert isinstance(result['guaranteed'], bool)
    
    def test_calculate_pull_counts(self, calculator, mock_wishes):
        """Test pull count calculation."""
        result = calculator.calculate_pull_counts(mock_wishes)
        assert len(result) == len(mock_wishes)
        # Check that pity field was added
        assert 'pity' in result[0]