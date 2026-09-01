from typing import List
import math
from sqlalchemy.orm import Session

class ProductRecommendationService:
    """Ranking rekomendasi produk berdasarkan kesesuaian karakteristik panen."""

    PRODUCT_TEMPLATES_DEFAULT = {
        1: {"name": "Household Cleaner", "ideal_ph": (3.0, 4.0), "ideal_aroma": "sour", "ideal_color": "brown", "commercial_suitable": True, "description": "Household Cleaner product recommendation", "processing_instructions": "Use for household cleaner applications"},
        2: {"name": "Disinfectant", "ideal_ph": (2.5, 3.5), "ideal_aroma": "sour", "ideal_color": "dark_brown", "commercial_suitable": True, "description": "Disinfectant product recommendation", "processing_instructions": "Use for disinfectant applications"},
        3: {"name": "Liquid Fertilizer", "ideal_ph": (3.5, 5.0), "ideal_aroma": "sweet", "ideal_color": "amber", "commercial_suitable": True, "description": "Liquid Fertilizer product recommendation", "processing_instructions": "Use for liquid fertilizer applications"},
        4: {"name": "Pest Repellent", "ideal_ph": (3.0, 4.0), "ideal_aroma": "sour", "ideal_color": "brown", "commercial_suitable": True, "description": "Pest Repellent product recommendation", "processing_instructions": "Use for pest repellent applications"},
        5: {"name": "Drain Cleaner", "ideal_ph": (2.5, 3.5), "ideal_aroma": "sour", "ideal_color": "dark_brown", "commercial_suitable": True, "description": "Drain Cleaner product recommendation", "processing_instructions": "Use for drain cleaner applications"},
        6: {"name": "Odor Neutralizer", "ideal_ph": (3.5, 5.0), "ideal_aroma": "sweet", "ideal_color": "light_brown", "commercial_suitable": False, "description": "Odor Neutralizer product recommendation", "processing_instructions": "Use for odor neutralizer applications"},
        7: {"name": "Cosmetic Base", "ideal_ph": (4.0, 5.5), "ideal_aroma": "sweet", "ideal_color": "amber", "commercial_suitable": False, "description": "Cosmetic Base product recommendation", "processing_instructions": "Use for cosmetic base applications"},
        8: {"name": "Animal Feed Additive", "ideal_ph": (3.5, 5.0), "ideal_aroma": "sweet", "ideal_color": "light_brown", "commercial_suitable": True, "description": "Animal Feed Additive product recommendation", "processing_instructions": "Use for animal feed additive applications"},
    }
    
    @staticmethod
    def get_templates(db: Session = None) -> dict:
        """Ambil template produk dari DB; fallback ke default jika tanpa DB/kosong."""
        if db is None:
            return ProductRecommendationService.PRODUCT_TEMPLATES_DEFAULT
        
        from app.models.base import ProductTemplate
        templates = db.query(ProductTemplate).all()
        
        if not templates:
            return ProductRecommendationService.PRODUCT_TEMPLATES_DEFAULT
        
        result = {}
        for t in templates:
            result[t.id] = {
                "name": t.name,
                "ideal_ph": (t.ideal_ph_min or 3.0, t.ideal_ph_max or 5.0),
                "ideal_aroma": t.ideal_aroma or "sour",
                "ideal_color": t.ideal_color or "brown",
                "commercial_suitable": getattr(t, 'commercial_suitable', True),
                "description": getattr(t, 'description', f"{t.name} product recommendation"),
                "processing_instructions": getattr(t, 'processing_instructions', f"Use for {t.name.lower()} applications")
            }
        return result
    
    @staticmethod
    def calculate_compatibility(
        product_id: int,
        final_color: str,
        aroma_intensity: str,
        final_volume_liters: float,
        final_ph: float = 4.0,
        user_intent: str = "household",
        templates: dict = None
    ) -> float:
        """Hitung skor kompatibilitas 0-100 antara hasil panen dan produk.

        Rumus: (color*0.3 + aroma*0.3 + volume*0.1 + ph*0.2) x intent_bonus x 100.
        """
        if templates is None:
            templates = ProductRecommendationService.PRODUCT_TEMPLATES_DEFAULT
        
        if product_id not in templates:
            return 0.0
        
        product = templates[product_id]
        
        color_match = ProductRecommendationService._color_similarity(final_color, product["ideal_color"])
        aroma_match = ProductRecommendationService._aroma_similarity(aroma_intensity, product["ideal_aroma"])
        
        product_name = product["name"].lower()
        if "cleaner" in product_name or "disinfectant" in product_name:
            min_vol = 2.0
        elif "fertilizer" in product_name or "repellent" in product_name:
            min_vol = 1.0
        elif "cosmetic" in product_name:
            min_vol = 0.5
        else:
            min_vol = 5.0
            
        volume_match = min(final_volume_liters / min_vol, 1.0)
        
        ph_min, ph_max = product["ideal_ph"]
        if ph_min <= final_ph <= ph_max:
            ph_match = 1.0
        else:
            dist = min(abs(final_ph - ph_min), abs(final_ph - ph_max))
            ph_match = max(0.0, 1.0 - (dist * 0.5))
            
        is_commercial = product.get("commercial_suitable", True)
        intent_bonus = 1.2 if (user_intent == "commercial" and is_commercial) else 1.0
        
        score = (color_match * 0.3 + aroma_match * 0.3 + volume_match * 0.1 + ph_match * 0.2) * intent_bonus
        return min(100, max(0, score * 100))
    
    @staticmethod
    def _color_similarity(user_color: str, ideal_color: str) -> float:
        """Skor kemiripan warna: 1.0 sama persis, 0.75 segrup, 0.3 lainnya."""
        user_color_lower = user_color.lower()
        ideal_color_lower = ideal_color.lower()
        
        if user_color_lower == ideal_color_lower:
            return 1.0
        
        color_groups = {
            "brown": ["brown", "dark_brown", "light_brown"],
            "amber": ["amber", "gold", "honey"],
            "dark": ["dark_brown", "black", "very_dark"]
        }
        
        for group_colors in color_groups.values():
            if user_color_lower in group_colors and ideal_color_lower in group_colors:
                return 0.75
        
        return 0.3
    
    @staticmethod
    def _aroma_similarity(user_aroma: str, ideal_aroma: str) -> float:
        """Skor kemiripan aroma: 1.0 sama, 0.85 sweet<->fruity / sour<->tangy, 0.4 lainnya."""
        user_aroma_lower = user_aroma.lower()
        ideal_aroma_lower = ideal_aroma.lower()
        
        if user_aroma_lower == ideal_aroma_lower:
            return 1.0
        
        if user_aroma_lower in ["sweet", "fruity"] and ideal_aroma_lower in ["sweet", "fruity"]:
            return 0.85
        if user_aroma_lower in ["sour", "tangy"] and ideal_aroma_lower in ["sour", "tangy"]:
            return 0.85
        if user_aroma_lower == "neutral" or ideal_aroma_lower == "neutral":
            return 0.6
        
        return 0.4
    
    @staticmethod
    def get_ranked_recommendations(
        final_color: str,
        aroma_intensity: str,
        final_volume_liters: float,
        final_ph: float = 4.0,
        user_intent: str = "household",
        db: Session = None
    ) -> List[dict]:
        """Ranking semua template produk by compatibility score (desc).

        Returns:
            List[dict]: Top 8 rekomendasi, masing-masing berisi product_id,
                name, compatibility_score, description, summary.
        """
        templates = ProductRecommendationService.get_templates(db)
        recommendations = []
        
        for product_id, product_info in templates.items():
            score = ProductRecommendationService.calculate_compatibility(
                product_id, final_color, aroma_intensity, final_volume_liters, final_ph, user_intent, templates
            )
            recommendations.append({
                "product_id": product_id,
                "name": product_info["name"],
                "compatibility_score": round(score, 2),
                "description": product_info.get("description", f"{product_info['name']} product recommendation"),
                "processing_instruction_summary": product_info.get("processing_instructions", f"Use for {product_info['name'].lower()} applications")
            })
        
        recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
        return recommendations[:8]
