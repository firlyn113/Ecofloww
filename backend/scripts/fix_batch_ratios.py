"""
Migration Script: Koreksi Rasio Eco-Enzyme pada Batch yang Sudah Ada
====================================================================

Script ini memperbaiki data batch lama yang menggunakan formula rasio SALAH:
- Formula lama: gula = sampah × 1, air = sampah × 3 (SALAH)
- Formula benar: gula = sampah × (1/3), air = sampah × (10/3) (BENAR)

Rasio standar eco-enzyme (Dr. Rosukon Poompanvong):
  1 (gula) : 3 (sampah organik) : 10 (air)

Perubahan yang dilakukan:
1. Koreksi nilai water_liters dan sugar_kg pada semua batch
2. Koreksi harvest_date berdasarkan start_date + 90 hari (jika salah)
3. Reset waste_diverted_kg pada user (karena sebelumnya dihitung prematur)

Penggunaan:
  python -m scripts.fix_batch_ratios [--dry-run]
  
  --dry-run: Hanya menampilkan perubahan tanpa menyimpan ke database
"""

import sys
import os
from datetime import timedelta

# Tambahkan path parent agar bisa import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.base import FermentationBatch, User


# Rasio standar eco-enzyme
RATIO_SUGAR = 1
RATIO_WASTE = 3
RATIO_WATER = 10
FERMENTATION_DAYS = 90


def fix_batch_ratios(dry_run: bool = False):
    """Koreksi rasio bahan pada semua batch yang ada di database."""
    db = SessionLocal()
    
    try:
        batches = db.query(FermentationBatch).all()
        
        if not batches:
            print("✅ Tidak ada batch di database. Tidak perlu koreksi.")
            return
        
        print(f"📊 Ditemukan {len(batches)} batch untuk diperiksa.\n")
        print("=" * 80)
        
        corrected_count = 0
        already_correct = 0
        
        for batch in batches:
            waste_kg = batch.waste_weight_kg
            
            # Hitung nilai yang BENAR
            correct_sugar = round(waste_kg * (RATIO_SUGAR / RATIO_WASTE), 2)
            correct_water = round(waste_kg * (RATIO_WATER / RATIO_WASTE), 2)
            correct_harvest = batch.start_date + timedelta(days=FERMENTATION_DAYS) if batch.start_date else None
            
            # Cek apakah nilai saat ini sudah benar (dengan toleransi 0.01)
            sugar_ok = abs(batch.sugar_kg - correct_sugar) < 0.01 if batch.sugar_kg else False
            water_ok = abs(batch.water_liters - correct_water) < 0.01 if batch.water_liters else False
            
            if sugar_ok and water_ok:
                already_correct += 1
                continue
            
            corrected_count += 1
            print(f"\n🔧 Batch #{batch.id}: \"{batch.name}\"")
            print(f"   Sampah: {waste_kg} kg")
            print(f"   Gula : {batch.sugar_kg} kg → {correct_sugar} kg")
            print(f"   Air  : {batch.water_liters} L → {correct_water} L")
            
            if not dry_run:
                batch.sugar_kg = correct_sugar
                batch.water_liters = correct_water
                if correct_harvest and batch.harvest_date != correct_harvest:
                    batch.harvest_date = correct_harvest
                    print(f"   Panen: {batch.harvest_date} → {correct_harvest}")
        
        # Reset waste_diverted_kg pada semua user yang punya batch
        # Hitung ulang berdasarkan batch yang COMPLETED/HARVESTED saja
        print("\n" + "=" * 80)
        print("\n📊 Mengkoreksi waste_diverted_kg pada semua user...")
        
        users = db.query(User).all()
        user_corrections = 0
        
        for user in users:
            # Hitung ulang: hanya batch completed/harvested yang dihitung
            completed_batches = db.query(FermentationBatch).filter(
                FermentationBatch.user_id == user.id,
                FermentationBatch.status.in_(["completed", "harvested"])
            ).all()
            
            correct_waste_diverted = sum(b.waste_weight_kg for b in completed_batches)
            old_value = user.waste_diverted_kg or 0.0
            
            if abs(old_value - correct_waste_diverted) > 0.01:
                user_corrections += 1
                print(f"   User #{user.id}: {old_value} kg → {correct_waste_diverted} kg")
                
                if not dry_run:
                    user.waste_diverted_kg = correct_waste_diverted
        
        if not dry_run:
            db.commit()
            print(f"\n✅ Koreksi selesai!")
        else:
            print(f"\n🔍 [DRY RUN] Tidak ada perubahan yang disimpan.")
        
        print(f"\n📋 Ringkasan:")
        print(f"   Total batch    : {len(batches)}")
        print(f"   Sudah benar    : {already_correct}")
        print(f"   Dikoreksi      : {corrected_count}")
        print(f"   User dikoreksi : {user_corrections}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    
    if dry_run:
        print("🔍 Mode DRY RUN — tidak ada perubahan yang akan disimpan.\n")
    else:
        print("⚠️  Mode LIVE — perubahan akan disimpan ke database.\n")
        confirm = input("Lanjutkan? (y/n): ").strip().lower()
        if confirm != "y":
            print("Dibatalkan.")
            sys.exit(0)
    
    fix_batch_ratios(dry_run=dry_run)
