import pytest
from datetime import datetime, timedelta
from app.services.eco_enzyme import EcoEnzymeService


class TestEcoEnzymeService:
    def test_calculate_ingredients_basic(self):
        result = EcoEnzymeService.calculate_ingredients(10)
        
        assert result["ideal_water_liters"] == 33.33
        assert result["ideal_sugar_kg"] == 3.33
        assert isinstance(result["expected_harvest_date"], datetime)
    
    def test_calculate_ingredients_different_weights(self):
        result = EcoEnzymeService.calculate_ingredients(5)
        assert result["ideal_water_liters"] == 16.67
        assert result["ideal_sugar_kg"] == 1.67
        
        result = EcoEnzymeService.calculate_ingredients(20)
        assert result["ideal_water_liters"] == 66.67
        assert result["ideal_sugar_kg"] == 6.67
    
    def test_calculate_ingredients_harvest_date_90_days(self):
        before = datetime.utcnow()
        result = EcoEnzymeService.calculate_ingredients(10)
        after = datetime.utcnow()
        
        harvest = result["expected_harvest_date"]
        diff = (harvest - before).days
        assert 89 <= diff <= 91
    
    def test_check_ingredient_deviation_exact_match(self):
        result = EcoEnzymeService.check_ingredient_deviation(10, 33.33, 3.33)
        
        assert result["water_deviation"] == 0.0
        assert result["sugar_deviation"] == 0.0
        assert result["has_warning"] is False
        assert result["warnings"] == []
    
    def test_check_ingredient_deviation_exceeds_threshold(self):
        result = EcoEnzymeService.check_ingredient_deviation(10, 38.0, 3.33, threshold=0.1)
        
        assert result["water_deviation"] > 0.1
        assert result["sugar_deviation"] == 0.0
        assert result["has_warning"] is True
        assert len(result["warnings"]) == 1
    
    def test_check_ingredient_deviation_both_exceed(self):
        result = EcoEnzymeService.check_ingredient_deviation(10, 38.0, 4.5, threshold=0.1)
        
        assert result["water_deviation"] > 0.1
        assert result["sugar_deviation"] > 0.1
        assert result["has_warning"] is True
        assert len(result["warnings"]) == 2
    
    def test_check_ingredient_deviation_custom_threshold(self):
        result = EcoEnzymeService.check_ingredient_deviation(10, 35.0, 3.33, threshold=0.15)
        
        assert result["has_warning"] is False
