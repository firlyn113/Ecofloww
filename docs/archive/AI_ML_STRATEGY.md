# AI_ML_STRATEGY.md: EcoFlow AI

> **Status (Aug 2026):** Saat ini seluruh fitur AI diimplementasikan sebagai **deterministic rule-based / heuristic services** (tanpa dependency runtime ML seperti TensorFlow/scikit-learn di `requirements.txt`): klasifikasi fermentasi (Normal/Caution/Failed), scoring kompatibilitas produk, dan bisnis analisis. Dokumen ini adalah **strategi visioner** — bagian yang menyebut model ML terlatih (section 4-5) adalah rencana pasca-MVP (FR-8), bukan kondisi saat ini.

## 1. AI/ML Vision and Goals

The Artificial Intelligence and Machine Learning (AI/ML) strategy for EcoFlow AI is centered on transforming raw fermentation data into actionable insights and personalized guidance, acting as an adaptive "Decision Assistant." Our vision is to empower users (households and UMKM) to successfully produce eco-enzymes and derive valuable products, thereby maximizing organic waste utilization and fostering a circular economy.

**Key AI/ML Goals:**
*   **Maximize Fermentation Success:** Reduce failure rates by proactively identifying issues and suggesting corrective actions.
*   **Optimize Product Derivation:** Guide users to the most suitable and valuable derivative products based on their harvest characteristics and goals.
*   **Enhance User Confidence:** Provide clear, data-driven recommendations that build trust and encourage continued engagement.
*   **Enable Business Viability:** Offer intelligent financial projections and market insights for UMKM.
*   **Drive Data-Driven Sustainability:** Aggregate anonymized data to demonstrate environmental impact and inform future policy.

## 2. Core AI/ML Components

EcoFlow AI employs a hybrid AI approach, combining rule-based systems for foundational calculations and immediate feedback with machine learning models for pattern recognition, classification, and personalized recommendations.

### 2.1. Smart Eco-Enzyme Roadmap (FR-1)

*   **Purpose:** To provide precise, initial ingredient ratios for eco-enzyme fermentation, minimizing setup errors.
*   **AI/ML Role:** Rule-based calculation and validation.
*   **Input Data:** User-provided `organic_waste_weight` (kg).
*   **Output:** `ideal_water_volume` (L), `ideal_sugar_weight` (kg), `ingredient_checklist`, `deviation_warnings`.
*   **Model Type:** Deterministic Rule-Based System.
    *   **Rule 1 (Water Ratio):** `Water (L) = Waste (kg) × 3`
    *   **Rule 2 (Sugar Ratio):** `Sugar (kg) = Waste (kg) × 1`
    *   **Rule 3 (Warning Threshold):** If user's input for water or sugar deviates by `>10%` from calculated ideal, trigger a warning.
*   **Training Data:** N/A (rule-based).
*   **Evaluation Metrics:** Accuracy of calculation, user adherence to recommended ratios (indirectly measured by fermentation success rates).

### 2.2. AI Fermentation Assistant (FR-2)

*   **Purpose:** To monitor fermentation progress, detect anomalies, classify status, and suggest corrective actions.
*   **AI/ML Role:** Hybrid: Rule-based for initial classification and corrective actions; Machine Learning for confidence scoring and nuanced anomaly detection.
*   **Input Data:**
    *   `fermentation_log_entries` (daily/weekly): `aroma` (enum: sweet/sour/rotten), `color` (hex/preset), `gas_presence` (boolean), `temperature` (°C), `pH` (manual input, future enhancement).
    *   `incubation_day` (derived from start date).
    *   `initial_ingredient_ratios`.
*   **Output:** `fermentation_status` (Normal/Caution/Failed), `health_score` (0-100), `corrective_action_suggestions`, `harvest_readiness_alert`.
*   **Model Type:**
    *   **Primary Classifier (Rule-Based):**
        *   **Normal:** `aroma` = sweet/sour, `gas_presence` = true (initial weeks), `color` = expected range, `temperature` = optimal range (20-30°C).
        *   **Caution:** `aroma` = slightly rotten, `gas_presence` = false (unexpectedly), `color` = unexpected shift, `temperature` = outside optimal range.
        *   **Failed:** `aroma` = strongly rotten/moldy, `color` = black/green mold, `pH` > 4.0 (if available).
    *   **Secondary Classifier (Supervised ML):** A lightweight classification model (e.g., Logistic Regression, Decision Tree, or a small Neural Network using `scikit-learn` or `TensorFlow`) trained on historical, labeled fermentation data.
        *   **Features:** Normalized `incubation_day`, `aroma_encoding`, `color_encoding`, `gas_presence_binary`, `temperature_deviation_from_optimal`.
        *   **Labels:** `fermentation_outcome` (Success/Partial Success/Failure).
        *   **Output:** `confidence_score` for each status, used to refine rule-based classification and generate the `health_score`.
*   **Training Data:**
    *   Initial dataset: Expert-labeled fermentation logs (simulated or collected from pilot users).
    *   Ongoing: Anonymized user-submitted logs with their eventual `fermentation_outcome` (success/failure) and `harvest_characteristics`.
*   **Evaluation Metrics:**
    *   **Accuracy:** Percentage of correctly classified fermentation statuses.
    *   **Precision/Recall:** For identifying 'Caution' and 'Failed' states.
    *   **False Positive Rate:** Minimizing incorrect 'Failed' alerts.
    *   **User Action Rate:** How often users follow corrective suggestions.

### 2.3. AI Product Recommendation (FR-3)

*   **Purpose:** To recommend the most suitable derivative products based on the harvested eco-enzyme liquid's characteristics and user goals.
*   **AI/ML Role:** Content-based recommendation system.
*   **Input Data:**
    *   `harvest_characteristics`: `volume` (L), `final_color` (hex/preset), `aroma_intensity` (1-10), `pH` (if measured).
    *   `user_goal`: (dropdown: household use, commercial/UMKM, specific product type).
    *   `product_templates`: Predefined profiles for 8+ derivative products (Household Cleaner, Disinfectant, Liquid Fertilizer, Pest Repellent, Drain Cleaner, Odor Neutralizer, Cosmetic Base, Animal Feed Additive), each with required `liquid_characteristics` and `target_use_case`.
*   **Output:** `ranked_product_recommendations` with `compatibility_score` (0-100), `product_specific_processing_instructions`.
*   **Model Type:**
    *   **Similarity-Based Matching:**
        *   Each `product_template` has a vector of ideal characteristics (e.g., `[ideal_pH, ideal_aroma_intensity, ideal_color_hue, target_use_case_vector]`).
        *   The `harvest_characteristics` are converted into a similar vector.
        *   **Cosine Similarity** or **Euclidean Distance** is used to calculate the similarity between the harvested liquid vector and each product template vector.
        *   `user_goal` acts as a weighting factor or filter, prioritizing products aligning with the user's stated intent. For example, if `user_goal` is 'commercial', cosmetic base might be ranked higher even if a household cleaner has slightly better characteristic match.
    *   **Rule-Based Filtering:** Apply hard constraints (e.g., if `pH` is too high, exclude cosmetic base; if `aroma` is too strong, exclude animal feed additive).
*   **Training Data:**
    *   Initial: Expert-defined `product_templates` and their ideal `liquid_characteristics`.
    *   Ongoing: User feedback on recommendation quality (`user_satisfaction_rating`) and actual product chosen/produced. This feedback can be used to refine similarity weights or train a more complex ranking model over time.
*   **Evaluation Metrics:**
    *   **Recommendation Accuracy:** Percentage of users who select a recommended product.
    *   **User Satisfaction:** Average rating of recommendations.
    *   **Diversity:** Ensuring a range of relevant recommendations, not just the top one.

### 2.4. Adaptive Roadmap (FR-4)

*   **Purpose:** To provide step-by-step processing guides for selected derivative products.
*   **AI/ML Role:** Not directly ML. This feature leverages the output of the AI Product Recommendation (FR-3) to dynamically retrieve and present structured content.
*   **Input Data:** `selected_product_recommendation_ID`.
*   **Output:** `step_by_step_guide`, `ingredient_lists`, `equipment_requirements`, `time_estimates`, `safety_warnings`, `downloadable_PDF`, `QR_codes_to_video_tutorials`.
*   **Model Type:** Content Retrieval and Dynamic Rendering System.
*   **Training Data:** N/A (content-driven).
*   **Evaluation Metrics:** User completion rate of roadmaps, feedback on clarity and usefulness of instructions.

### 2.5. Business Analysis (FR-5)

*   **Purpose:** To provide financial projections and viability analysis for UMKM-oriented users.
*   **AI/ML Role:** Primarily rule-based financial modeling. Future iterations could incorporate predictive analytics for market trends.
*   **Input Data:**
    *   `commercial_inputs`: `production_volume` (L), `target_market`, `packaging_type`, `distribution_channel`.
    *   `cost_inputs`: `raw_material_cost` (sugar, water, waste value), `packaging_cost`, `labor_cost`, `overhead_cost`.
    *   `regional_market_data`: Average selling prices for similar products, competitor pricing (if available).
*   **Output:** `COGS`, `SRP_suggestion`, `gross_margin`, `break_even_units`, `profit_projection` (12-month), `sensitivity_analysis`, `business_viability_report`.
*   **Model Type:** Deterministic Financial Model with Rule-Based Benchmarking.
    *   **Formulas:** Standard accounting formulas for COGS, Gross Margin, Break-Even.
    *   **Rules for SRP:** Suggest SRP based on COGS + target margin, benchmarked against `regional_market_data` (e.g., `SRP = max(COGS * 1.5, regional_average * 0.9)`).
    *   **Sensitivity Analysis:** Apply fixed percentage variations (e.g., ±10%) to key cost/revenue inputs.
*   **Training Data:** N/A (rule-based).
*   **Evaluation Metrics:** Accuracy of financial projections (compared to actual UMKM outcomes), user satisfaction with business insights.

## 3. Data Strategy for AI/ML

A robust data strategy is crucial for the success and continuous improvement of EcoFlow AI's ML models.

### 3.1. Data Sources
*   **User Input Data:**
    *   Fermentation logs (aroma, color, gas, temperature, pH).
    *   Organic waste weight, initial ingredient ratios.
    *   Harvest characteristics (volume, final color, aroma intensity).
    *   User goals (household vs. commercial).
    *   Business analysis inputs (production volume, costs).
    *   User feedback on recommendations and roadmap usefulness.
*   **System-Generated Data:**
    *   Calculated ideal ratios.
    *   Fermentation status classifications and health scores.
    *   Recommendation compatibility scores.
    *   Roadmap progress tracking.
*   **External Data (Curated):**
    *   Expert-defined `product_templates` and their ideal `liquid_characteristics`.
    *   Regional market pricing data for derivative products (for Business Analysis).
    *   Environmental impact conversion factors (e.g., kg organic waste to CO₂ avoided).

### 3.2. Data Collection & Storage
*   **Collection:** Data is primarily collected via the user interface (web/mobile app) through explicit user input and implicit actions (e.g., selecting a recommendation).
*   **Storage:** PostgreSQL database for structured data (user profiles, fermentation batches, logs, product templates) and MinIO (S3-compatible) for unstructured data (image uploads, generated PDF reports).
*   **Anonymization:** All user-specific data used for model training will be anonymized and aggregated to protect privacy. Personal identifiers will be stripped or hashed.

### 3.3. Data Preprocessing & Feature Engineering
*   **Categorical Encoding:** Convert categorical inputs (aroma, color presets, user goals) into numerical representations (e.g., one-hot encoding, label encoding) for ML models.
*   **Normalization/Scaling:** Scale numerical features (temperature, aroma intensity, pH) to a common range to prevent features with larger values from dominating model training.
*   **Feature Creation:**
    *   `incubation_day`: Derived from `start_date` and current date.
    *   `temperature_deviation`: Difference from optimal temperature range.
    *   `ratio_deviation`: Deviation from ideal water/sugar ratios.
*   **Data Validation:** Implement checks to ensure data quality, consistency, and completeness at the point of entry.

## 4. Model Development and Deployment Strategy

### 4.1. Model Development Workflow
1.  **Problem Definition:** Clearly define the AI/ML task (e.g., classification, recommendation).
2.  **Data Collection & Preparation:** Gather, clean, and preprocess data as per Section 3.3.
3.  **Feature Engineering:** Create relevant features from raw data.
4.  **Model Selection:** Choose appropriate algorithms (e.g., `scikit-learn` for classification, similarity metrics for recommendations). Start with simpler models (e.g., Logistic Regression, Decision Trees) for MVP.
5.  **Training & Validation:** Train models on historical data, validate performance using hold-out sets and cross-validation.
6.  **Hyperparameter Tuning:** Optimize model parameters for best performance.
7.  **Evaluation:** Assess model performance against defined metrics (Section 2).

### 4.2. Technology Stack for AI/ML
*   **Saat ini (MVP, shipped):** Heuristic services murni Python — `fermentation_assistant.py` (rule-based weighted classification), `product_recommendation.py` (scoring berbasis kemiripan warna/aroma/volume dari tabel `product_templates`), `business_analysis.py` (kalkulasi finansial deterministik). Tanpa dependency ML eksternal.
*   **Rencana Pasca-MVP (FR-8):** `scikit-learn` untuk model terlatih; `TensorFlow Lite` untuk potensi inference edge mobile; `NumPy`/`Pandas` untuk pengolahan data.
*   **Backend Integration:** Python FastAPI akan host endpoint inference (saat ini semua logika sudah inline di service layer).

### 4.3. Inference Strategy
*   **Cloud Inference (MVP):** All ML inference will initially occur on the backend server (FastAPI). This simplifies deployment and updates.
*   **Edge Inference (Future):** For mobile responsiveness and offline capability, `TensorFlow Lite` could be explored to run smaller models directly on the user's device for features like fermentation status classification, reducing latency and server load.

## 5. AI/ML Operations (MLOps)

Effective MLOps ensure that AI/ML models remain performant, reliable, and relevant over time.

### 5.1. Model Versioning
*   Store different versions of trained models and their associated code, configurations, and training data.
*   Use Git for code versioning and potentially DVC (Data Version Control) for data and model artifacts.

### 5.2. Model Deployment
*   Deploy models as RESTful API endpoints via FastAPI.
*   Implement blue/green or canary deployments for seamless updates with minimal downtime.

### 5.3. Model Monitoring
*   **Performance Monitoring:** Track key metrics (accuracy, precision, recall) in production using Prometheus and Grafana.
*   **Data Drift Detection:** Monitor input data distributions for changes that could degrade model performance (e.g., new types of organic waste, changes in user logging patterns).
*   **Concept Drift Detection:** Monitor the relationship between model predictions and actual outcomes (e.g., if fermentation success rates drop despite high model confidence).
*   **User Feedback Loop:** Continuously collect explicit user feedback on recommendation quality and fermentation outcomes to identify model deficiencies.

### 5.4. Model Retraining Strategy
*   **Scheduled Retraining:** Periodically retrain models (e.g., quarterly) with new, anonymized user data to capture evolving patterns and improve accuracy.
*   **Triggered Retraining:** Initiate retraining if significant data drift, concept drift, or a sustained drop in model performance is detected.
*   **A/B Testing:** Implement an A/B testing framework (FR-8) to evaluate new model versions or algorithm variants against current production models before full rollout.

## 6. Ethical AI Considerations

Given EcoFlow AI's role as a decision assistant, ethical considerations are paramount.

*   **Bias Mitigation:**
    *   **Data Collection:** Actively seek diverse fermentation data from various regions, waste types, and user demographics to prevent bias in model training.
    *   **Model Evaluation:** Regularly audit models for fairness across different user segments.
    *   **Transparency:** Clearly communicate the basis of recommendations (e.g., "Based on your aroma and color, this product is highly compatible").
*   **Transparency & Explainability:**
    *   Provide confidence scores for fermentation status and product recommendations.
    *   Explain *why* a particular recommendation was made (e.g., "Recommended due to high pH and strong aroma").
*   **Privacy:**
    *   Strict adherence to data privacy principles (e.g., GDPR-equivalent for Indonesia).
    *   Anonymize and aggregate user data before using it for model training.
    *   Obtain explicit user consent for data collection and usage.
*   **Accountability:**
    *   Clearly state that AI recommendations are guidance, not guarantees.
    *   Provide disclaimers regarding fermentation outcomes (Risk Analysis: Fermentation Failure Liability).
    *   Maintain audit trails of model predictions and user actions.

## 7. Future AI/ML Enhancements

The MVP will establish the foundational AI/ML capabilities. Future iterations will focus on expanding sophistication and impact.

*   **Advanced Fermentation Monitoring:**
    *   Integrate with IoT sensors (pH, temperature, gas sensors) for real-time data input (Out of Scope v1.0).
    *   Computer Vision for automated color and mold detection from image uploads.
    *   Predictive modeling for fermentation duration and optimal harvest time.
*   **Personalized Learning:**
    *   Develop user profiles to adapt recommendations based on past success rates, preferences, and skill level.
    *   Reinforcement learning to optimize recommendation strategies based on long-term user satisfaction and product adoption.
*   **Market Intelligence & Predictive Analytics:**
    *   Leverage external market data to provide more dynamic and accurate pricing suggestions for UMKM.
    *   Predict market demand for specific eco-enzyme derivatives.
*   **Natural Language Processing (NLP):**
    *   Allow more natural language input for fermentation logs (e.g., "smells a bit like vinegar").
    *   Develop a conversational AI interface for the Fermentation Assistant.
*   **Environmental Impact Modeling:**
    *   More sophisticated models to estimate CO₂ reduction, water savings, and soil health improvement based on eco-enzyme usage.