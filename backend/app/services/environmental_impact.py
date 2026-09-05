from sqlalchemy.orm import Session
from app.models.base import FermentationBatch

class EnvironmentalImpactService:
    """
    Perhitungan dampak lingkungan dari pengalihan sampah organik.
    Faktor konversi:
    - CO2 Reduction: 0.5 kg CO2 per kg sampah (fermentasi vs landfill)
    - Water Saved: 2 liter per kg sampah (fermentasi vs TPA)
    - Trees Equivalent: 1 pohon menyerap ~21.77 kg CO2/tahun
    """

    CO2_PER_KG_WASTE = 0.5
    WATER_SAVED_PER_KG = 2.0
    CO2_PER_TREE = 21.77

    @classmethod
    def calculate_user_impact(cls, db: Session, user_id: int) -> dict:
        """
        Hitung dampak agregat untuk seorang user dari batch yang completed/harvested.
        """
        completed_batches = db.query(FermentationBatch).filter(
            FermentationBatch.user_id == user_id,
            FermentationBatch.status.in_(["completed", "harvested"])
        ).all()

        return cls.calculate_impact_summary(completed_batches)

    @classmethod
    def calculate_impact_summary(cls, batches) -> dict:
        total_waste_kg = sum((batch.waste_weight_kg or 0.0) for batch in batches)
        co2_avoided = total_waste_kg * cls.CO2_PER_KG_WASTE
        water_saved = total_waste_kg * cls.WATER_SAVED_PER_KG
        tree_equivalents = co2_avoided / cls.CO2_PER_TREE
        methane_avoided = total_waste_kg * 0.08

        return {
            "limbah_teralihkan_kg": round(total_waste_kg, 2),
            "methane_dicegah_kg": round(methane_avoided, 2),
            "co2_dikurangi_kg": round(co2_avoided, 2),
            "air_terselamatkan_liter": round(water_saved, 2),
            "setara_pohon": round(tree_equivalents, 2),
        }

    @classmethod
    def calculate_batch_impact(cls, waste_weight_kg: float) -> dict:
        """Hitung dampak lingkungan untuk satu batch."""
        co2_avoided = waste_weight_kg * cls.CO2_PER_KG_WASTE
        water_saved = waste_weight_kg * cls.WATER_SAVED_PER_KG
        tree_equivalents = co2_avoided / cls.CO2_PER_TREE

        return {
            "limbah_teralihkan_kg": waste_weight_kg,
            "co2_dikurangi_kg": co2_avoided,
            "air_terselamatkan_liter": water_saved,
            "setara_pohon": tree_equivalents,
        }

