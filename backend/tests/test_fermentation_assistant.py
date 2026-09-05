import pytest
from app.services.fermentation_assistant import FermentationAssistantService


class TestFermentationAssistantService:
    def test_classify_fermentation_normal(self):
        status, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma="sweet",
            color="brown",
            gas_presence=True,
            temperature_c=25,
            incubation_day=30
        )
        
        assert status == "Normal"
        assert confidence >= 0.8
        assert "normal" in suggestion.lower()
    
    def test_classify_fermentation_failed_aroma(self):
        status, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma="strongly_rotten",
            color="brown",
            gas_presence=True,
            temperature_c=25,
            incubation_day=30
        )
        
        assert status == "Failed"
        assert confidence >= 0.9
        assert "gagal" in suggestion.lower() or "failed" in suggestion.lower()
    
    def test_classify_fermentation_failed_color(self):
        status, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma="sweet",
            color="green",
            gas_presence=True,
            temperature_c=25,
            incubation_day=30
        )
        
        assert status == "Failed"
    
    def test_classify_fermentation_caution_temperature_and_gas(self):
        status, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma="slightly_rotten",
            color="brown",
            gas_presence=False,
            temperature_c=15,
            incubation_day=30
        )
        
        assert status == "Caution"
        assert "suhu" in suggestion.lower() or "temperature" in suggestion.lower()
    
    def test_classify_fermentation_caution_multiple_factors(self):
        status, confidence, suggestion = FermentationAssistantService.classify_fermentation(
            aroma="slightly_rotten",
            color="unexpected_shift",
            gas_presence=False,
            temperature_c=25,
            incubation_day=50
        )
        
        assert status == "Caution"
    
    def test_calculate_health_score_normal(self):
        score = FermentationAssistantService.calculate_health_score("Normal", 0.9, 30)
        assert 75 < score < 95
    
    def test_calculate_health_score_caution(self):
        score = FermentationAssistantService.calculate_health_score("Caution", 0.7, 30)
        assert 40 < score < 70
    
    def test_calculate_health_score_failed(self):
        score = FermentationAssistantService.calculate_health_score("Failed", 0.9, 30)
        assert 0 <= score < 30
    
    def test_calculate_health_score_max_100(self):
        score = FermentationAssistantService.calculate_health_score("Normal", 1.0, 100)
        assert score <= 100
    
    def test_should_trigger_harvest_alert_true(self):
        alert = FermentationAssistantService.should_trigger_harvest_alert(
            status="Normal",
            incubation_day=90,
            gas_presence=False,
            aroma="sweet"
        )
        
        assert alert is True
    
    def test_should_trigger_harvest_alert_false_too_early(self):
        alert = FermentationAssistantService.should_trigger_harvest_alert(
            status="Normal",
            incubation_day=60,
            gas_presence=False,
            aroma="sweet"
        )
        
        assert alert is False
    
    def test_should_trigger_harvest_alert_false_failed_status(self):
        alert = FermentationAssistantService.should_trigger_harvest_alert(
            status="Failed",
            incubation_day=90,
            gas_presence=False,
            aroma="sweet"
        )
        
        assert alert is False
    
    def test_should_trigger_harvest_alert_false_gas_active(self):
        alert = FermentationAssistantService.should_trigger_harvest_alert(
            status="Normal",
            incubation_day=90,
            gas_presence=True,
            aroma="sweet"
        )
        
        assert alert is False
