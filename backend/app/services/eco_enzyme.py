from datetime import datetime, timedelta

class EcoEnzymeService:
    """Perhitungan rasio bahan eco-enzyme (1 : 3 : 10 = gula : sampah organik : air).
    
    Rasio standar internasional Dr. Rosukon Poompanvong:
    - 1 bagian gula (molase/gula merah)
    - 3 bagian sampah organik (kulit buah, sisa sayur)
    - 10 bagian air

    Contoh: Jika sampah = 3 kg, maka gula = 1 kg, air = 10 liter.
    """

    # Rasio standar eco-enzyme: 1 (gula) : 3 (sampah) : 10 (air)
    RATIO_SUGAR = 1
    RATIO_WASTE = 3
    RATIO_WATER = 10
    FERMENTATION_DAYS = 90  # Durasi standar fermentasi

    @staticmethod
    def calculate_ingredients(waste_kg: float, start_date: datetime = None) -> dict:
        """Hitung kebutuhan air, gula, dan tanggal panen dari berat sampah.

        Rumus berdasarkan rasio 1:3:10 (gula:sampah:air):
        - Gula  = sampah × (1/3)
        - Air   = sampah × (10/3)
        - Panen = tanggal mulai + 90 hari

        Args:
            waste_kg: Berat sampah organik (kg). Harus > 0.
            start_date: Tanggal mulai fermentasi (default: sekarang).

        Returns:
            dict: {"ideal_water_liters", "ideal_sugar_kg", "expected_harvest_date",
                   "total_volume_liters"}.

        Raises:
            ValueError: Jika waste_kg <= 0.
        """
        if waste_kg <= 0:
            raise ValueError("Berat sampah harus lebih dari 0 kg")

        # Rasio 1:3:10 → gula = sampah × (1/3), air = sampah × (10/3)
        ideal_sugar = round(waste_kg * (EcoEnzymeService.RATIO_SUGAR / EcoEnzymeService.RATIO_WASTE), 2)
        ideal_water = round(waste_kg * (EcoEnzymeService.RATIO_WATER / EcoEnzymeService.RATIO_WASTE), 2)

        # Estimasi total volume (kg ≈ liter untuk campuran cair)
        total_volume = round(ideal_sugar + waste_kg + ideal_water, 2)

        base_date = start_date if start_date else datetime.utcnow()
        
        return {
            "ideal_water_liters": ideal_water,
            "ideal_sugar_kg": ideal_sugar,
            "total_volume_liters": total_volume,
            "expected_harvest_date": base_date + timedelta(days=EcoEnzymeService.FERMENTATION_DAYS)
        }

    @staticmethod
    def validate_container_size(waste_kg: float, container_size_liters: float) -> dict:
        """Validasi apakah wadah cukup besar untuk menampung semua bahan.

        Wadah harus menyisakan minimal 15% ruang kosong untuk gas fermentasi.

        Args:
            waste_kg: Berat sampah organik (kg).
            container_size_liters: Ukuran wadah (liter).

        Returns:
            dict: {"is_valid", "required_size_liters", "message"}.
        """
        calc = EcoEnzymeService.calculate_ingredients(waste_kg)
        total_volume = calc["total_volume_liters"]
        # Wadah harus minimal 115% dari total volume (sisakan 15% untuk gas)
        required_size = round(total_volume / 0.85, 1)

        if container_size_liters < required_size:
            return {
                "is_valid": False,
                "required_size_liters": required_size,
                "total_volume_liters": total_volume,
                "message": f"Wadah terlalu kecil. Dibutuhkan minimal {required_size}L "
                           f"untuk {total_volume}L bahan + ruang gas fermentasi."
            }
        return {
            "is_valid": True,
            "required_size_liters": required_size,
            "total_volume_liters": total_volume,
            "message": "Ukuran wadah memadai."
        }
    
    @staticmethod
    def check_ingredient_deviation(
        waste_kg: float,
        user_water: float,
        user_sugar: float,
        threshold: float = 0.1
    ) -> dict:
        """Cek deviasi bahan user terhadap rasio ideal.

        Args:
            waste_kg: Berat sampah (kg).
            user_water: Air yang dipakai user (L).
            user_sugar: Gula yang dipakai user (kg).
            threshold: Ambang deviasi yang ditoleransi (default 0.1 = 10%).

        Returns:
            dict: {"water_deviation", "sugar_deviation", "has_warning", "warnings"}.
        """
        if waste_kg <= 0:
            raise ValueError("Berat sampah harus lebih dari 0 kg")

        ideal = EcoEnzymeService.calculate_ingredients(waste_kg)
        ideal_water = ideal["ideal_water_liters"]
        ideal_sugar = ideal["ideal_sugar_kg"]
        
        water_deviation = abs(user_water - ideal_water) / ideal_water if ideal_water > 0 else 0
        sugar_deviation = abs(user_sugar - ideal_sugar) / ideal_sugar if ideal_sugar > 0 else 0
        
        warnings = []
        if water_deviation > threshold:
            warnings.append(
                f"Deviasi air: {water_deviation*100:.1f}% dari ideal "
                f"({ideal_water:.2f}L). Batas toleransi: {threshold*100:.0f}%"
            )
        if sugar_deviation > threshold:
            warnings.append(
                f"Deviasi gula: {sugar_deviation*100:.1f}% dari ideal "
                f"({ideal_sugar:.2f}kg). Batas toleransi: {threshold*100:.0f}%"
            )
        
        return {
            "water_deviation": round(water_deviation, 4),
            "sugar_deviation": round(sugar_deviation, 4),
            "ideal_water_liters": ideal_water,
            "ideal_sugar_kg": ideal_sugar,
            "has_warning": len(warnings) > 0,
            "warnings": warnings
        }
