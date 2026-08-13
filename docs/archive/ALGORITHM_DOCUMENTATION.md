# ALGORITHM_DOCUMENTATION.md: EcoFlow AI — Dokumentasi Algoritma

> Penjelasan lengkap semua algoritma & formula di balik fitur AI EcoFlow AI.
> Semua algoritma bersifat **deterministic, rule-based** (bukan ML eksternal) — mudah diuji & dijelaskan.
> Implementasi: `backend/app/services/`.

---

## 1. Ringkasan Algoritma

| # | Algoritma | Service | Input → Output |
|---|-----------|---------|----------------|
| 1 | Rasio bahan eco-enzyme (1:3:10) | `eco_enzyme.py` | waste_kg → air, gula, tanggal panen |
| 2 | Klasifikasi status fermentasi | `fermentation_assistant.py` | aroma, warna, gas, suhu, hari → Normal/Caution/Failed |
| 3 | Health score | `fermentation_assistant.py` | status + confidence + hari → skor 0–100 |
| 4 | Harvest alert | `fermentation_assistant.py` | status + hari + gas + aroma → boolean |
| 5 | Compatibility scoring produk | `product_recommendation.py` | karakteristik panen → skor 0–100 per produk |
| 6 | Analisis kelayakan bisnis | `business_analysis.py` | biaya & volume → 13 metrik finansial |
| 7 | Dampak lingkungan | `environmental_impact.py` | kg sampah → CO₂, metana, air, pohon |
| 8 | Roadmap state machine | `roadmap.py` | step toggle → status & progress |

---

## 2. Algoritma Rasio Eco-Enzyme (1:3:10)

**Formula standar eco-enzyme:** `1 gula : 3 sampah organik : 10 air`.

```python
ideal_water = waste_kg * 3      # liter
ideal_sugar = waste_kg * 1      # kg
harvest_date = start_date + 90 hari
```

### Deviasi Bahan (`check_ingredient_deviation`)

```
water_deviation = |user_water - ideal_water| / ideal_water
sugar_deviation = |user_sugar - ideal_sugar| / ideal_sugar
warning jika deviation > threshold (default 0.1 = 10%)
```

### Contoh Perhitungan

| Input | Nilai |
|-------|-------|
| waste | 10 kg |
| user water | 35 L, user sugar 12 kg |

```
ideal_water = 30 L, ideal_sugar = 10 kg
water_dev = |35-30|/30 = 0.167 → ⚠️ > 0.1
sugar_dev  = |12-10|/10 = 0.20  → ⚠️ > 0.1
has_warning = true (2 warnings)
```

---

## 3. Algoritma Klasifikasi Fermentasi

### 3.1 Lookup Tables (Rule Set)

**Aroma:**
| Skor | Nilai |
|------|-------|
| Failed | `strongly_rotten`, `moldy` |
| Caution | `slightly_rotten`, `unusual` |
| Normal | `sweet`, `sour` |

**Warna:**
| Skor | Nilai |
|------|-------|
| Failed | `black`, `green`, `white_mold` |
| Caution | `unexpected_shift`, `unusual` |
| Normal | `brown`, `dark_brown`, `amber` |

**Suhu:** optimal `20 ≤ T ≤ 30` °C → di luar range = +1 caution.

**Gas:** jika `incubation_day ≥ 7` dan tidak ada gas → +1 caution. Hari < 7 tanpa gas = normal (fase awal).

### 3.2 Decision Tree

```
                 ┌─────────────────────────────────┐
                 │ count indikator dari tabel di atas│
                 └─────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             failed_count ≥ 1     failed_count == 0
                    │                   │
            ┌───────┴───────┐   ┌───────┴───────┐
            ▼               ▼   ▼               ▼
      status = "Failed"   (lanjut)    caution_count ≥ 2   caution_count < 2
      confidence = 0.9    check      status = "Caution"  status = "Normal"
      saran: mulai ulang  caution    confidence = 0.7    confidence = 0.85
                                     saran korektif      saran: lanjutkan
```

### 3.3 Contoh Kasus

**Kasus 1 — Normal:** aroma `sweet`, warna `brown`, gas ✅, suhu 25°C, hari 30
```
failed=0, caution=0 → Normal, 0.85
```

**Kasus 2 — Failed (aroma):** aroma `moldy`, warna `brown`, gas ✅, suhu 25°C, hari 30
```
failed=1 → Failed, 0.9
```

**Kasus 3 — Caution:** aroma `sweet`, warna `brown`, gas ❌, suhu 15°C, hari 30
```
caution: gas(1) + suhu(1) = 2 → Caution, 0.7
suggestion: "Increase temperature (ideal: 20-30°C)"
```

---

## 4. Algoritma Health Score (0–100)

```python
base_score = {Normal: 80, Caution: 50, Failed: 10}
confidence_bonus = confidence * 20 - 10          # ±8 s.d. 8
progress_bonus   = min(days_elapsed / 90 * 10, 10)  # maks 10
health_score = base + confidence_bonus + progress_bonus
# clamp: min(100, max(0, score))
```

### Contoh

| Status | Confidence | Hari | Perhitungan | Skor |
|--------|-----------|------|-------------|------|
| Normal | 0.85 | 30 | 80 + (17-10) + 3.3 | **90.3** |
| Caution | 0.7 | 30 | 50 + (14-10) + 3.3 | **57.3** |
| Failed | 0.9 | 90 | 10 + (18-10) + 10 | **28** |

---

## 5. Algoritma Harvest Alert

```python
ideal_range = 83 ≤ incubation_day ≤ 97
is_normal   = status == "Normal"
ready_signs = gas_presence AND aroma ∈ {sweet, sour}
alert = ideal_range AND is_normal AND ready_signs
```

**Logika domain:** batch siap panen hanya di jendela hari 83–97, status sehat, dan menunjukkan tanda matang (gas masih ada + aroma normal).

---

## 6. Algoritma Compatibility Score Produk (0–100)

### 6.1 Rumus

```
color_match  = similarity(warna_user, ideal_warna_produk)     # bobot 0.4
aroma_match  = similarity(intensitas_aroma, ideal_aroma)      # bobot 0.4
volume_match = min(final_volume / 10, 1.0)                    # bobot 0.2
intent_bonus = 1.2 jika intent == "commercial" DAN produk ∉ {6 (Odor Neutralizer), 7 (Cosmetic Base)}
               1.0 selainnya

score = (color×0.4 + aroma×0.4 + volume×0.2) × intent_bonus × 100
```

### 6.2 Similarity Rules

**Color:**
| Kondisi | Nilai |
|---------|-------|
| Sama persis | 1.0 |
| Grup sama: `{brown, dark_brown, light_brown}` / `{amber, gold, honey}` / `{dark_brown, black, very_dark}` | 0.75 |
| Lainnya | 0.3 |

**Aroma:**
| Kondisi | Nilai |
|---------|-------|
| Sama persis | 1.0 |
| `sweet`↔`fruity` / `sour`↔`tangy` | 0.85 |
| Lainnya | 0.4 |

### 6.3 Contoh Perhitungan

**Input:** final_color=`dark_brown`, aroma=`sour`, volume=10 L, intent=`household`
**Target produk:** Disinfectant (ideal_color=`dark_brown`, ideal_aroma=`sour`)

```
color_match  = 1.0 (sama persis)
aroma_match  = 1.0 (sama persis)
volume_match = min(10/10, 1) = 1.0
intent_bonus = 1.0 (household)

score = (1.0×0.4 + 1.0×0.4 + 1.0×0.2) × 1.0 × 100 = 100.0
```

**Produk yang sama tapi volume 3 L:**
```
volume_match = 0.3
score = (0.4 + 0.4 + 0.06) × 100 = 86.0
```

**Produk berbeda (Cosmetic Base, ideal amber/sweet) dari input di atas:**
```
color: dark_brown vs amber → tidak sama, tidak segrup → 0.3
aroma: sour vs sweet → 0.4
volume = 1.0
score = (0.12 + 0.16 + 0.2) × 100 = 48.0
```

### 6.4 Ranking

Semua 8 produk di-score, diurutkan **descending**, diambil **top 8** (selalu semua, karena template hanya 8).

---

## 7. Algoritma Analisis Bisnis

### 7.1 Pipeline

```
Input: production_volume, raw_material, packaging, labor, overhead, monthly_fixed, regional_price
  │
  ├─ 1. COGS
  │      total_cost = raw + packaging + labor + overhead
  │      cogs_per_liter = total_cost / volume
  │
  ├─ 2. SRP (Suggested Retail Price)
  │      base = cogs × 1.5
  │      jika regional_price ada: srp = max(base, regional × 0.9)
  │
  ├─ 3. Margins
  │      gross_margin/unit = srp − cogs
  │      gross_margin% = (gross_margin/unit) / srp × 100
  │      total_revenue = srp × volume
  │      total_gross_profit = gross_margin/unit × volume
  │
  ├─ 4. Break-even
  │      contribution = srp − cogs
  │      bep_units = (fixed_costs × 12) / contribution
  │      bep_revenue = bep_units × srp
  │
  ├─ 5. Proyeksi 12 bulan (asumsi produksi merata)
  │      monthly_revenue = (volume/12) × srp
  │      monthly_net = monthly_revenue − (volume/12)×cogs − monthly_fixed
  │      yearly_net = monthly_net × 12
  │      breakeven_months = monthly_fixed / (monthly_gross + 0.01) [guard div-by-0]
  │
  ├─ 6. Sensitivity (±10%)
  │      pessimistic = yearly − yearly×0.1
  │      optimistic  = yearly + yearly×0.1
  │
  └─ 7. Viability rating
         Viable:    yearly > 5000 AND gross% > 30
         Marginal:  yearly > 1000 AND gross% > 20
         Not Viable: selainnya
```

### 7.2 Contoh Numerik

| Input | Nilai |
|-------|-------|
| volume | 100 L |
| raw | 500.000 |
| packaging | 300.000 |
| labor | 200.000 |
| overhead | 100.000 |
| monthly fixed | 150.000 |
| regional price | 20.000 |

```
total_cost  = 1.100.000 → cogs = 11.000/L
base SRP    = 11.000 × 1.5 = 16.500
regional    = max(16.500, 20.000×0.9=18.000) → SRP = 18.000
gross/unit  = 7.000 → 38.89%
total revenue = 1.800.000, gross profit = 700.000
bep units   = (150.000×12)/7.000 = 257,14 L
monthly rev = (100/12)×18.000 = 150.000
monthly cogs= (100/12)×11.000 = 91.667
monthly gross = 58.333 → monthly net = 58.333 − 150.000 = −91.667 (rugi)
yearly net  = −1.100.000 → sensitivity ±110.000 → Not Viable
```

> Contoh ini menggambarkan bahwa biaya tetap perlu lebih rendah agar viable.

---

## 8. Algoritma Dampak Lingkungan

```
co2_avoided   = waste_kg × 1.9 kg        # CO₂ terhindar per kg sampah
methane       = waste_kg × 0.06 kg       # metana terhindar
water_saved   = waste_kg × 5.0 L         # air dihemat
trees         = (co2_avoided / 1000) × 45  # pohon setara per ton CO₂
```

**Contoh:** 100 kg sampah → 190 kg CO₂, 6 kg metana, 500 L air, 8,55 pohon setara.

---

## 9. Roadmap State Machine

```
              toggle step (completed/not)
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
completed==0   0 < done < total   done == total
      │               │               │
      ▼               ▼               ▼
 not_started     in_progress       completed
 current=0      current=max(done  current=last
 completed_at   index)+1          completed_at=now
 =null          started_at=now     (set sekali)
                (set sekali)
```

Progress: `progress% = completed_steps / total_steps × 100`.

---

## 10. Cara Memvalidasi Perubahan Algoritma

1. **Setiap perubahan rumus** harus update test di `backend/tests/test_<service>.py`.
2. Jalankan: `cd backend && source venv/bin/activate && pytest tests/ -q`.
3. Hitung ulang contoh di dokumen ini — jika hasil berubah, **update dokumentasi ini**.
4. Perhatikan batas (boundary): threshold 0.1, suhu 20/30°C, hari 7/83/97, skor clamp 0–100.

---

## 11. Referensi

- [backend/app/services/README.md](backend/app/services/README.md) — dokumentasi service
- [AI_ML_STRATEGY.md](./AI_ML_STRATEGY.md) — strategi AI/ML tingkat tinggi
- [DATA_DICTIONARY.md](./DATA_DICTIONARY.md) — field & business rules
