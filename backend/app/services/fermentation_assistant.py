from datetime import datetime, timedelta
from typing import Tuple

class FermentationAssistantService:
    """AI klasifikasi status fermentasi eco-enzyme (deterministic rule-based).
    
    Siklus gas fermentasi eco-enzyme:
    - Minggu 1-4: Gas aktif (gelembung banyak, tekanan tinggi)
    - Bulan 2: Gas mulai berkurang
    - Bulan 3 (hari 60-90): Gas minimal/hampir tidak ada → tanda matang
    """

    AROMA_NORMAL = ["sweet", "sour"]
    AROMA_CAUTION = ["slightly_rotten", "unusual"]
    AROMA_FAILED = ["strongly_rotten", "moldy"]
    
    COLOR_NORMAL = ["brown", "dark_brown", "amber"]
    COLOR_CAUTION = ["unexpected_shift", "unusual"]
    COLOR_FAILED = ["black", "green", "white_mold"]

    # Fase fermentasi berdasarkan hari
    PHASE_EARLY = 30       # Hari 0-30: fase awal (gas aktif normal)
    PHASE_MID = 60         # Hari 31-60: fase tengah (gas mulai berkurang)
    HARVEST_START = 83     # Hari 83: jendela panen dimulai
    HARVEST_END = 97       # Hari 97: batas akhir jendela panen ideal
    
    @staticmethod
    def classify_fermentation(
        aroma: str,
        color: str,
        gas_presence: bool,
        temperature_c: float,
        incubation_day: int,
        initial_ratio_ok: bool = True
    ) -> Tuple[str, float, str]:
        """Klasifikasikan status fermentasi berdasarkan observasi user.

        Aturan: >=1 indikator failed -> "Failed"; >=2 indikator caution ->
        "Caution"; selainnya "Normal".

        Args:
            aroma: Nilai aroma (lihat AROMA_* constants).
            color: Nilai warna (lihat COLOR_* constants).
            gas_presence: Ada gelembung gas atau tidak.
            temperature_c: Suhu ruangan (°C); optimal 20-30.
            incubation_day: Hari ke-berapa fermentasi (sejak start).
            initial_ratio_ok: Apakah rasio bahan awal sesuai.

        Returns:
            Tuple[str, float, str]: (status, confidence, suggestion).
        """
        status = "Normal"
        confidence = 0.8
        suggestion = ""
        
        aroma_lower = aroma.lower()
        color_lower = color.lower()
        temp_optimal = 20 <= temperature_c <= 30
        
        failed_count = 0
        caution_count = 0
        
        # Cek aroma
        if aroma_lower in FermentationAssistantService.AROMA_FAILED:
            failed_count += 1
        elif aroma_lower in FermentationAssistantService.AROMA_CAUTION:
            caution_count += 1
        
        # Cek warna
        if color_lower in FermentationAssistantService.COLOR_FAILED:
            failed_count += 1
        elif color_lower in FermentationAssistantService.COLOR_CAUTION:
            caution_count += 1
        
        # Cek suhu
        if not temp_optimal:
            caution_count += 1
        
        # Cek gas berdasarkan fase fermentasi
        # Fase awal (hari 1-30): gas HARUS ada, tidak ada gas = masalah
        # Fase tengah (hari 31-60): gas mulai berkurang, normal
        # Fase akhir (hari 61+): gas seharusnya minimal/tidak ada
        if incubation_day <= FermentationAssistantService.PHASE_EARLY:
            # Fase awal: tidak ada gas setelah minggu pertama = caution
            if incubation_day >= 7 and not gas_presence:
                caution_count += 1
        elif incubation_day <= FermentationAssistantService.PHASE_MID:
            # Fase tengah: gas masih ada itu normal, tidak ada juga normal
            pass
        else:
            # Fase akhir (>60 hari): gas masih aktif = caution (belum stabil)
            if gas_presence:
                caution_count += 1
        
        # Tentukan status akhir
        if failed_count >= 1:
            status = "Failed"
            confidence = 0.9
            suggestion = "Fermentasi tampak gagal. Disarankan untuk memulai batch baru."
        elif caution_count >= 2:
            status = "Caution"
            confidence = 0.7
            suggestions = []
            if not temp_optimal:
                if temperature_c < 20:
                    suggestions.append("Naikkan suhu ruangan (ideal: 20-30°C)")
                else:
                    suggestions.append("Turunkan suhu ruangan (ideal: 20-30°C)")
            if aroma_lower in FermentationAssistantService.AROMA_CAUTION:
                suggestions.append("Pantau aroma secara ketat; bau sedikit menyimpang mungkin akan membaik")
            if color_lower in FermentationAssistantService.COLOR_CAUTION:
                suggestions.append("Perhatikan perubahan warna; perubahan tak terduga bisa jadi tanda kontaminasi")
            if incubation_day > FermentationAssistantService.PHASE_MID and gas_presence:
                suggestions.append("Gas masih aktif setelah 60 hari; fermentasi belum stabil sepenuhnya")
            suggestion = "; ".join(suggestions) if suggestions else "Terus pantau dengan seksama."
        else:
            status = "Normal"
            confidence = 0.85
            if incubation_day >= FermentationAssistantService.HARVEST_START:
                suggestion = "Fermentasi berjalan normal dan sudah memasuki jendela panen. Pertimbangkan untuk memanen."
            elif incubation_day >= FermentationAssistantService.PHASE_MID:
                suggestion = "Fermentasi berjalan normal. Memasuki fase pematangan akhir."
            else:
                suggestion = "Fermentasi berjalan normal. Terus pantau setiap hari."
        
        return status, confidence, suggestion
    
    @staticmethod
    def calculate_health_score(
        status: str,
        confidence: float,
        days_elapsed: int
    ) -> float:
        """Hitung health score 0-100 dari status, confidence, dan durasi.

        Rumus: base(Normal=80/Caution=50/Failed=10) + (confidence*20-10)
               + min(days/90*10, 10), di-clamp 0-100.
        """
        base_score = {
            "Normal": 80,
            "Caution": 50,
            "Failed": 10
        }.get(status, 50)
        
        confidence_bonus = confidence * 20
        progress_bonus = min(days_elapsed / 90 * 10, 10)
        
        health_score = base_score + (confidence_bonus - 10) + progress_bonus
        return min(100, max(0, health_score))
    
    @staticmethod
    def should_trigger_harvest_alert(
        status: str,
        incubation_day: int,
        gas_presence: bool,
        aroma: str
    ) -> bool:
        """Tentukan apakah batch sudah masuk jendela panen (hari 83-97).

        Kriteria panen yang benar:
        - Hari fermentasi antara 83-97 (jendela panen ideal)
        - Status "Normal" (tidak gagal/bermasalah)
        - Gas TIDAK aktif (fermentasi sudah stabil/matang)
        - Aroma normal (manis/asam = tanda eco-enzyme sehat)
        
        Catatan penting: Pada eco-enzyme yang matang, gas sudah berhenti.
        Gas aktif di bulan ke-3 justru tanda fermentasi belum selesai.

        Returns:
            bool: True jika batch siap dipanen.
        """
        ideal_range = (FermentationAssistantService.HARVEST_START 
                      <= incubation_day 
                      <= FermentationAssistantService.HARVEST_END)
        is_normal = status == "Normal"
        # PERBAIKAN: Gas harus TIDAK ada (fermentasi matang = gas berhenti)
        ready_signs = (not gas_presence) and aroma.lower() in FermentationAssistantService.AROMA_NORMAL
        
        return ideal_range and is_normal and ready_signs

