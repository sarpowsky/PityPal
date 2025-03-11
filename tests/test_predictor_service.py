# tests/test_predictor_service.py
import pytest
from unittest.mock import patch, MagicMock

# Mock modules that cause problems
@pytest.fixture(autouse=True)
def mock_imports():
    modules = {
        'matplotlib': MagicMock(),
        'matplotlib.pyplot': MagicMock(),
        'numpy': MagicMock(),
        'pandas': MagicMock()
    }
    
    with patch.dict('sys.modules', modules):
        yield

class TestPredictorService:
    @pytest.fixture
    def service(self):
        with patch('os.path.exists', return_value=True):
            from backend.services.pity_predictor.predictor_service import PredictorService
            service = PredictorService()
            service._generate_image = MagicMock(return_value="mock_image_data")
            return service
    
    @patch('backend.services.pity_predictor.predictor_service.predict_next_pulls')
    @patch('backend.services.pity_predictor.predictor_service.calculate_cumulative_probability') 
    @patch('backend.services.pity_predictor.predictor_service.plot_probabilities')
    def test_predict(self, mock_plot, mock_cumulative, mock_predict, service):
        mock_predict.return_value = [0.1, 0.2]
        mock_cumulative.return_value = [0.1, 0.3]
        mock_plot.return_value = MagicMock()
        
        result = service.predict(10, 'character-1', False, 2)
        
        assert result["success"] is True
        assert len(result["predictions"]) == 2
        assert result["summary"]["current_pity"] == 10