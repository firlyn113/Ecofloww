from typing import Dict
from sqlalchemy.orm import Session

class BusinessAnalysisService:
    """Analisis kelayakan bisnis produksi eco-enzyme (COGS, SRP, margin, BEP)."""
    
    # Harga konstan
    SUGAR_PRICE_PER_KG = 15000
    FRUIT_WASTE_PRICE_PER_KG = 5000
    WATER_PRICE_PER_LITER = 1000
    SELLING_PRICE_PER_LITER = 25000

    @staticmethod
    def calculate_cogs(
        production_volume_liters: float,
        raw_material_cost: float,
        packaging_cost: float,
        labor_cost: float,
        overhead_cost: float
    ) -> dict:
        """Hitung COGS (Cost of Goods Sold) per liter.

        Returns:
            dict: {"total_cost", "cogs_per_liter"}.
        """
        total_cost = raw_material_cost + packaging_cost + labor_cost + overhead_cost
        cogs_per_liter = total_cost / production_volume_liters if production_volume_liters > 0 else 0
        
        return {
            "total_cost": total_cost,
            "cogs_per_liter": round(cogs_per_liter, 2)
        }
    
    @staticmethod
    def calculate_srp(
        cogs_per_liter: float,
        regional_average_price: float = None,
        markup_multiplier: float = 1.5
    ) -> float:
        """Hitung harga jual yang disarankan (SRP).

        Base = COGS x markup (1.5). Jika regional price ada, pakai nilai
        terbesar antara base dan 90% harga regional.
        """
        base_srp = cogs_per_liter * markup_multiplier
        
        if regional_average_price:
            conservative_srp = regional_average_price * 0.9
            final_srp = max(base_srp, conservative_srp)
        else:
            final_srp = base_srp
        
        return round(final_srp, 2)
    
    @staticmethod
    def calculate_margins(
        cogs_per_liter: float,
        srp_per_liter: float,
        production_volume_liters: float
    ) -> dict:
        """Hitung gross margin, total revenue, dan gross profit."""
        gross_margin_per_unit = srp_per_liter - cogs_per_liter
        gross_margin_percentage = (gross_margin_per_unit / srp_per_liter * 100) if srp_per_liter > 0 else 0
        total_revenue = srp_per_liter * production_volume_liters
        total_gross_profit = gross_margin_per_unit * production_volume_liters
        
        return {
            "gross_margin_per_liter": round(gross_margin_per_unit, 2),
            "gross_margin_percentage": round(gross_margin_percentage, 2),
            "total_revenue": round(total_revenue, 2),
            "total_gross_profit": round(total_gross_profit, 2)
        }
    
    @staticmethod
    def calculate_break_even(
        cogs_per_liter: float,
        srp_per_liter: float,
        fixed_costs: float
    ) -> dict:
        """Hitung break-even point dalam unit (liter) dan revenue."""
        contribution_margin = srp_per_liter - cogs_per_liter
        break_even_units = fixed_costs / contribution_margin if contribution_margin > 0 else 0
        break_even_revenue = break_even_units * srp_per_liter
        
        return {
            "break_even_units_liters": round(break_even_units, 2),
            "break_even_revenue": round(break_even_revenue, 2)
        }
    
    @staticmethod
    def calculate_12month_projection(
        production_volume_liters: float,
        srp_per_liter: float,
        cogs_per_liter: float,
        monthly_fixed_costs: float
    ) -> dict:
        """Proyeksi 12 bulan dengan asumsi produksi merata tiap bulan."""
        monthly_revenue = (production_volume_liters / 12) * srp_per_liter
        monthly_cogs = (production_volume_liters / 12) * cogs_per_liter
        monthly_gross_profit = monthly_revenue - monthly_cogs
        monthly_net_profit = monthly_gross_profit - monthly_fixed_costs
        yearly_net_profit = monthly_net_profit * 12
        
        return {
            "monthly_revenue": round(monthly_revenue, 2),
            "monthly_cogs": round(monthly_cogs, 2),
            "monthly_gross_profit": round(monthly_gross_profit, 2),
            "monthly_net_profit": round(monthly_net_profit, 2),
            "yearly_net_profit": round(yearly_net_profit, 2),
            "breakeven_months": round(monthly_fixed_costs / (monthly_gross_profit + 0.01), 1) if monthly_gross_profit > 0 else None
        }
    
    @staticmethod
    def sensitivity_analysis(
        yearly_net_profit: float,
        variance_percentage: float = 0.1
    ) -> dict:
        """Analisis sensitivitas profit terhadap variance (default +-10%)."""
        variance = yearly_net_profit * variance_percentage
        pessimistic = yearly_net_profit - variance
        optimistic = yearly_net_profit + variance
        
        return {
            "base_case": round(yearly_net_profit, 2),
            "pessimistic": round(pessimistic, 2),
            "optimistic": round(optimistic, 2),
            "variance_percentage": variance_percentage * 100
        }
    
    @staticmethod
    def determine_viability(
        yearly_net_profit: float,
        gross_margin_percentage: float,
        breakeven_months: float = None
    ) -> str:
        """Tentukan rating kelayakan: Viable / Marginal / Not Viable.

        Viable: profit > 5000 dan margin > 30%.
        Marginal: profit > 1000 dan margin > 20%.
        """
        if yearly_net_profit > 5000 and gross_margin_percentage > 30:
            return "Viable"
        elif yearly_net_profit > 1000 and gross_margin_percentage > 20:
            return "Marginal"
        else:
            return "Not Viable"
    
    @staticmethod
    def generate_dynamic_recommendations(
        yearly_net_profit: float,
        gross_margin_percentage: float,
        roi_percentage: float,
        db: Session = None
    ) -> str:
        """Buat rekomendasi dinamis berdasarkan performa batch.
        
        Args:
            yearly_net_profit: Profit tahunan (IDR)
            gross_margin_percentage: Persentase margin kotor
            roi_percentage: Persentase ROI
            db: Database session untuk query data historis
        
        Returns:
            Rekomendasi teks dalam Bahasa Indonesia
        """
        # Analisis berdasarkan ROI dan margin
        if roi_percentage > 100:
            return "Pertahankan strategi produksi saat ini! ROI sangat tinggi (>100%). Fokus pada peningkatan skala dengan mengoptimalkan pengadaan bahan baku dan diversifikasi produk turunan."
        elif roi_percentage > 50:
            return "Strategi produksi cukup baik. Pertimbangkan untuk menambah variasi bahan baku untuk meningkatkan margin dan diversifikasi produk untuk mengurangi risiko pasar."
        elif gross_margin_percentage < 30:
            return "Margin masih rendah (<30%). Tingkatkan margin dengan: (1) Negosiasi harga bahan baku, (2) Optimasi rasio gula-sampah-air 1:3:10, (3) Diversifikasi produk bernilai tambah tinggi seperti bahan kosmetik."
        elif yearly_net_profit < 1000:
            return "Profitabilitas masih rendah. Evaluasi biaya produksi: (1) Cari supplier bahan baku lebih murah, (2) Otomatisasi proses untuk mengurangi biaya tenaga kerja, (3) Tingkatkan volume batch untuk mencapai economies of scale."
        else:
            return "Operasi dalam kondisi stabil. Rekomendasi: (1) Perluas ke produk bernilai tambah tinggi, (2) Bangun kemitraan dengan UMKM lokal, (3) Implementasi sistem monitoring real-time untuk kontrol kualitas."
    
    @staticmethod
    def calculate_roi(
        total_investment: float,
        yearly_net_profit: float
    ) -> float:
        """Hitung ROI (Return on Investment) dalam persentase."""
        return (yearly_net_profit / total_investment * 100) if total_investment > 0 else 0
    
    @staticmethod
    def calculate_growth_projection(
        historical_profits: list,
        db: Session = None
    ) -> float:
        """Hitung proyeksi pertumbuhan berdasarkan data historis.
        
        Args:
            historical_profits: List profit historis (IDR)
            db: Database session untuk query data batch
        
        Returns:
            Persentase proyeksi pertumbuhan (default 15% jika tidak ada data)
        """
        if not historical_profits or len(historical_profits) < 2:
            # Jika tidak ada data historis, gunakan default 15%
            return 15.0
        
        # Hitung growth rate dari data historis
        growth_rates = []
        for i in range(1, len(historical_profits)):
            if historical_profits[i-1] > 0:
                growth_rate = ((historical_profits[i] - historical_profits[i-1]) / historical_profits[i-1]) * 100
                growth_rates.append(growth_rate)
        
        if not growth_rates:
            return 15.0
        
        # Rata-rata growth rate historis
        average_growth = sum(growth_rates) / len(growth_rates)
        return round(average_growth, 2)
    
    @staticmethod
    def run_analysis(
        production_volume_liters: float,
        raw_material_cost: float,
        packaging_cost: float,
        labor_cost: float,
        overhead_cost: float,
        monthly_fixed_costs: float,
        regional_average_price: float = None
    ) -> dict:
        """Jalankan pipeline analisis bisnis lengkap (COGS -> viability rating).

        Returns:
            dict: Semua metrik finansial termasuk sensitivity_analysis
                dan viability_rating.
        """
        cogs_data = BusinessAnalysisService.calculate_cogs(
            production_volume_liters, raw_material_cost, packaging_cost, labor_cost, overhead_cost
        )
        cogs_per_liter = cogs_data["cogs_per_liter"]
        
        srp_per_liter = BusinessAnalysisService.calculate_srp(cogs_per_liter, regional_average_price)
        
        margins = BusinessAnalysisService.calculate_margins(cogs_per_liter, srp_per_liter, production_volume_liters)
        
        break_even = BusinessAnalysisService.calculate_break_even(cogs_per_liter, srp_per_liter, monthly_fixed_costs * 12)
        
        projection = BusinessAnalysisService.calculate_12month_projection(
            production_volume_liters, srp_per_liter, cogs_per_liter, monthly_fixed_costs
        )
        
        sensitivity = BusinessAnalysisService.sensitivity_analysis(projection["yearly_net_profit"])
        
        viability = BusinessAnalysisService.determine_viability(
            projection["yearly_net_profit"], margins["gross_margin_percentage"], projection["breakeven_months"]
        )
        
        return {
            "cogs_per_liter": cogs_per_liter,
            "suggested_retail_price": srp_per_liter,
            "gross_margin_per_liter": margins["gross_margin_per_liter"],
            "gross_margin_percentage": margins["gross_margin_percentage"],
            "total_revenue": margins["total_revenue"],
            "total_gross_profit": margins["total_gross_profit"],
            "break_even_units_liters": break_even["break_even_units_liters"],
            "break_even_revenue": break_even["break_even_revenue"],
            "monthly_revenue": projection["monthly_revenue"],
            "monthly_net_profit": projection["monthly_net_profit"],
            "yearly_net_profit": projection["yearly_net_profit"],
            "breakeven_months": projection["breakeven_months"],
            "sensitivity_analysis": sensitivity,
            "viability_rating": viability
        }
