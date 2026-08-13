# TESTING.md: EcoFlow AI

## 1. Test Strategy

The testing strategy for EcoFlow AI is designed to ensure the platform's reliability, accuracy, security, and performance across its diverse functionalities, from core fermentation guidance to AI-driven recommendations and business analysis. A multi-layered approach will be employed, encompassing various testing types throughout the development lifecycle.

### 1.1. Unit Testing
Focuses on individual components, functions, and methods in isolation.
*   **Objective:** Verify that each unit of code performs as expected according to its design.
*   **Scope:** Frontend components (React), Backend functions (FastAPI), utility functions, database interaction layers.

### 1.2. Integration Testing
Verifies the interactions and data flow between different modules and services.
*   **Objective:** Ensure that integrated components work together correctly (e.g., Frontend-Backend API calls, Backend-Database interactions, Backend-AI service communication).
*   **Scope:** API endpoints, database queries, authentication flows, AI model inference calls.

### 1.3. End-to-End (E2E) Testing
Simulates real user scenarios from start to finish, covering the entire application stack.
*   **Objective:** Validate critical user journeys and business processes (e.g., creating a new fermentation batch, logging daily progress, receiving product recommendations, generating a business report).
*   **Scope:** Full user workflows as defined in USERFLOW.md.

### 1.4. Performance Testing
Evaluates the system's responsiveness, stability, and scalability under various load conditions.
*   **Objective:** Ensure the platform meets NFRs for response time and handles projected user loads without degradation.
*   **Scope:** API endpoints, AI inference services, database queries, concurrent user simulations.

### 1.5. Security Testing
Identifies vulnerabilities and weaknesses in the application's security posture.
*   **Objective:** Protect user data, prevent unauthorized access, and comply with security NFRs (e.g., AES-256, TLS 1.3).
*   **Scope:** Authentication, authorization, data encryption, API security, input validation.

### 1.6. Accessibility Testing
Ensures the platform is usable by individuals with disabilities.
*   **Objective:** Adhere to WCAG 2.1 AA compliance as per NFRs.
*   **Scope:** UI components, navigation, content readability, keyboard accessibility.

### 1.7. AI Model Testing
Specifically evaluates the accuracy, robustness, and fairness of the AI/ML models.
*   **Objective:** Validate the effectiveness of the AI Fermentation Assistant and AI Product Recommendation models, and mitigate bias.
*   **Scope:** Model input/output, confidence scores, recommendation relevance, bias detection.

### 1.8. Offline Capability Testing
Verifies the application's ability to function and synchronize data when internet connectivity is intermittent or absent.
*   **Objective:** Ensure seamless user experience in rural areas with limited connectivity.
*   **Scope:** Data entry, local storage, synchronization mechanisms.

## 2. Test Cases per Feature

This section outlines key test cases for the core functional requirements, focusing on positive, negative, and edge scenarios.

### 2.1. FR-1: Smart Eco-Enzyme Roadmap

| Test ID | Description | Preconditions | Input Data | Expected Result |
|:---|:---|:---|:---|:---|
| FR1-001 | Valid waste input, calculate ratios | User logged in, on "New Fermentation" screen | Waste: 1.0 kg | Water: 3.0 L, Sugar: 1.0 kg displayed |
| FR1-002 | Valid waste input, calculate ratios (decimal) | User logged in, on "New Fermentation" screen | Waste: 1.5 kg | Water: 4.5 L, Sugar: 1.5 kg displayed |
| FR1-003 | User input within 10% deviation | Calculated Water: 3.0 L, Sugar: 1.0 kg | User enters Water: 3.2 L, Sugar: 1.05 kg | No warning displayed |
| FR1-004 | User input >10% deviation (Water) | Calculated Water: 3.0 L, Sugar: 1.0 kg | User enters Water: 3.4 L, Sugar: 1.0 kg | Warning: "Water deviates >10%. Adjust to ~3.0L." |
| FR1-005 | User input >10% deviation (Sugar) | Calculated Water: 3.0 L, Sugar: 1.0 kg | User enters Water: 3.0 L, Sugar: 0.8 kg | Warning: "Sugar deviates >10%. Adjust to ~1.0kg." |
| FR1-006 | Zero waste input | User logged in, on "New Fermentation" screen | Waste: 0 kg | Error message: "Waste weight cannot be zero." |
| FR1-007 | Negative waste input | User logged in, on "New Fermentation" screen | Waste: -0.5 kg | Error message: "Waste weight must be positive." |
| FR1-008 | Store calculation history | Complete FR1-001 | N/A | Calculation (1.0kg waste -> 3.0L water, 1.0kg sugar) stored and retrievable. |

### 2.2. FR-2: AI Fermentation Assistant

| Test ID | Description | Preconditions | Input Data (Log) | Expected Result |
|:---|:---|:---|:---|:---|
| FR2-001 | Normal fermentation log | Batch active, Day 30 | Aroma: Sweet, Color: Light Brown, Gas: Yes, Temp: 28°C | Status: Normal, Health Score: High (e.g., 90) |
| FR2-002 | Cautionary log (low gas) | Batch active, Day 45 | Aroma: Sweet, Color: Dark Brown, Gas: No, Temp: 25°C | Status: Caution, Suggestion: "Check for airtight seal, gently shake." |
| FR2-003 | Cautionary log (rotten aroma) | Batch active, Day 60 | Aroma: Rotten, Color: Dark Brown, Gas: Yes, Temp: 30°C | Status: Caution, Suggestion: "Add 50g sugar, check for mold." |
| FR2-004 | Failed fermentation (persistent rotten) | Batch active, Day 75 | Aroma: Rotten, Color: Black, Gas: No, Temp: 27°C (repeated) | Status: Failed, Suggestion: "Batch likely failed. Consider discarding." |
| FR2-005 | Harvest readiness alert | Batch active, Day 90 | Aroma: Sour, Color: Clear Amber, Gas: No, Temp: 26°C | Status: Normal, Alert: "Batch ready for harvest!" |
| FR2-006 | Image upload for log | Batch active, Day 15 | Image of fermentation jar | Image uploaded, associated with log entry. |
| FR2-007 | Invalid temperature input | Batch active, Day 10 | Aroma: Sweet, Color: Light Brown, Gas: Yes, Temp: -5°C | Error message: "Temperature out of valid range (0-50°C)." |
| FR2-008 | pH-based corrective action | Batch active, Day 40 | Aroma: Sour, Color: Light Brown, Gas: Yes, Temp: 28°C, pH: 3.2 | Status: Caution, Suggestion: "pH is low. Add 50g sugar to balance." |

### 2.3. FR-3: AI Product Recommendation

| Test ID | Description | Preconditions | Input Data (Harvest) | Expected Result |
|:---|:---|:---|:---|:---|
| FR3-001 | Optimal harvest, household use | Harvest confirmed | Volume: 3.5L, Color: Clear Amber, Aroma Intensity: 8 | Top Rec: Household Cleaner (Score 95), Disinfectant (Score 90) |
| FR3-002 | Optimal harvest, UMKM use | Harvest confirmed | Volume: 10L, Color: Clear Amber, Aroma Intensity: 8 | Top Rec: Liquid Fertilizer (Score 92), Pest Repellent (Score 88) |
| FR3-003 | Sub-optimal harvest (low aroma) | Harvest confirmed | Volume: 3.0L, Color: Dark Brown, Aroma Intensity: 3 | Top Rec: Drain Cleaner (Score 70), Liquid Fertilizer (Score 65) |
| FR3-004 | Request alternative recommendations | FR3-001 completed | User clicks "Show Alternatives" | Displays next 3 ranked products (e.g., Pest Repellent, Odor Neutralizer) |
| FR3-005 | Product-specific instructions | User selects "Household Cleaner" | N/A | Displays dilution ratios, storage, safety warnings for Household Cleaner. |
| FR3-006 | No suitable recommendation | Harvest confirmed | Volume: 1.0L, Color: Black, Aroma Intensity: 1 | Message: "No suitable product recommendation. Consider re-fermenting or discarding." |

### 2.4. FR-4: Adaptive Roadmap

| Test ID | Description | Preconditions | Input Data | Expected Result |
|:---|:---|:---|:---|:---|
| FR4-001 | Generate roadmap for Household Cleaner | User selected "Household Cleaner" | N/A | Displays step-by-step guide: "Dilute 1:10...", "Store in airtight bottle...", etc. |
| FR4-002 | Download PDF checklist | Roadmap displayed | User clicks "Download PDF" | PDF containing roadmap steps, ingredients, QR codes downloaded. |
| FR4-003 | Mark step as complete | Roadmap displayed, Step 1 active | User clicks "Mark Complete" for Step 1 | Step 1 marked complete, progress updated, Step 2 becomes active. |
| FR4-004 | Visual verification via image upload | Roadmap displayed, Step 2 active | User uploads image of diluted product | System attempts to verify step completion (if ML-enabled), marks complete or prompts review. |
| FR4-005 | Roadmap for complex product (Cosmetic Base) | User selected "Cosmetic Base" | N/A | Displays detailed multi-stage guide including heating, pH adjustment, specific ingredients. |

### 2.5. FR-5: Business Analysis (UMKM Orientation)

| Test ID | Description | Preconditions | Input Data | Expected Result |
|:---|:---|:---|:---|:---|
| FR5-001 | Calculate COGS, SRP, Margin (basic) | UMKM user, on Business Analysis | Production: 10L, Packaging: 1L bottles, Target Market: Local | COGS, SRP, Gross Margin calculated and displayed. |
| FR5-002 | Generate 12-month projection | FR5-001 completed | N/A | Displays monthly profit projection table with sensitivity analysis. |
| FR5-003 | Produce viability report | FR5-002 completed | N/A | PDF report generated with feasibility rating (e.g., "Viable"). |
| FR5-004 | Zero production volume | UMKM user, on Business Analysis | Production: 0L | Error message: "Production volume must be greater than zero." |
| FR5-005 | Negative cost input | UMKM user, on Business Analysis | Packaging cost: -$0.50 | Error message: "Costs cannot be negative." |
| FR5-006 | Sensitivity analysis impact | FR5-002 completed | View ±10% cost variance | Projection table updates to show impact of cost changes. |
| FR5-007 | Benchmark against regional data | FR5-001 completed | N/A | Displays comparison of calculated SRP/margin against regional averages (if available). |

### 2.6. FR-6: User Progress Dashboard

| Test ID | Description | Preconditions | Input Data | Expected Result |
|:---|:---|:---|:---|:---|
| FR6-001 | Display active batches | User has 2 active fermentations | N/A | Dashboard shows 2 cards/entries for active batches with current status (e.g., "Normal", "Caution"). |
| FR6-002 | Display completed products | User has completed 3 products | N/A | Dashboard shows list/summary of 3 completed products (e.g., "Household Cleaner", "Liquid Fertilizer"). |
| FR6-003 | Visualize cumulative waste diverted | User has logged 10kg waste | N/A | Dashboard shows "10 kg Organic Waste Diverted" and estimated CO₂ avoided. |
| FR6-004 | Upcoming milestones | Active batch due for log in 2 days | N/A | Dashboard shows "Log fermentation progress for Batch #XYZ in 2 days." |
| FR6-005 | Quick-access links | N/A | N/A | Links to "Start New Fermentation", "View All Batches", "Product Catalog" are visible. |

## 3. Test Coverage Targets

| Test Type | Target Coverage | Rationale |
|:---|:---|:---|
| **Unit Tests** | 80% of backend logic (Python) | Critical for core business logic and AI functions. |
| | 70% of frontend components (React) | Ensures individual UI elements and utility functions are robust. |
| **Integration Tests** | 90% of API endpoints | Verifies data flow and service interactions for all critical features. |
| | 100% of database interactions | Prevents data corruption and ensures data integrity. |
| **E2E Tests** | 80% of critical user journeys | Covers primary user flows (fermentation setup, logging, recommendation, business analysis). |
| **Performance Tests** | Meet NFRs for response time (<2s, <500ms AI inference) | Ensures platform responsiveness under load. |
| | Support 50K concurrent users | Validates scalability for projected growth. |
| **Security Tests** | Zero critical/high vulnerabilities | Protects sensitive user data and maintains trust. |
| **Accessibility Tests** | WCAG 2.1 AA compliance | Ensures inclusivity for all users. |
| **AI Model Tests** | 90% recommendation accuracy (user feedback) | Validates the core AI value proposition. |
| | <5% bias detection score | Mitigates unfair or skewed recommendations. |
| **Offline Capability Tests** | 100% for log entry and sync | Essential for target users in areas with poor connectivity. |

## 4. Testing Tools

The following tools will be utilized to implement the testing strategy, aligning with the chosen technology stack:

| Category | Tool | Purpose |
|:---|:---|:---|
| **Unit/Integration (Backend)** | Pytest | Python testing framework for FastAPI backend logic and API endpoints. |
| **Unit/Integration (Frontend)** | Jest, React Testing Library | JavaScript testing framework for React components and UI logic. |
| **E2E Testing** | Cypress / Playwright | Browser automation for simulating user interactions and end-to-end flows. ✅ Playwright automated (frontend E2E). |
| **Performance Testing** | JMeter / K6 | Load and stress testing for API endpoints and overall system performance. *(post-MVP)* |
| **Security Testing** | OWASP ZAP, Snyk | Automated vulnerability scanning, dependency analysis, and penetration testing. *(post-MVP; dependency audit via GitHub CI)* |
| **Accessibility Testing** | Lighthouse, Axe DevTools | Automated accessibility audits and checks against WCAG standards. |
| **AI Heuristic Testing** | Custom Python scripts (Pytest) | Verifies rule-based logic (ratio check, compatibility scoring, financial calculations) via unit tests — already covered in backend suite. |
| **AI Model Testing (post-MVP)** | Custom Python scripts (TensorFlow, scikit-learn), MLflow | Model evaluation metrics (precision, recall, F1-score), data drift detection, bias analysis. |
| **Database Testing** | Testcontainers (with Pytest) | Spin up temporary PostgreSQL instances for isolated database integration tests. |
| **API Testing** | Postman / Insomnia | Manual and automated testing of REST API endpoints. |
| **Code Coverage** | Coverage.py (Python), Istanbul (JS) | Measure the percentage of code executed by tests. |

## 5. CI Integration

**Sudah diimplementasikan** dengan GitHub Actions (`.github/workflows/ci.yml`) pada setiap push ke `main`:

### 5.1. Pipeline Stages (Current)
1.  **Backend Tests:** Setup Python 3.14, install `requirements.txt`, jalankan `alembic upgrade head` terhadap PostgreSQL service (GitHub Actions service container), lalu `pytest tests/ -q` (26+ tests).
2.  **Frontend Lint & Build:** Setup Node 20, `npm ci`, `npm run lint`, `npm run build`.

### 5.2. Pipeline Stages (Roadmap — post-MVP)
1.  **E2E Tests:** Playwright dijalankan terhadap staging environment. Failure blocks the pipeline.
2.  **Performance Tests (Smoke):** Basic performance checks untuk memastikan tidak ada regresi besar.
3.  **Security Scans:** Automated vulnerability scans (e.g., Snyk). Warnings reported, critical failures block.
4.  **Deployment to Staging/Production:** Setelah semua stage pass, deploy ke staging untuk manual QA.

### 5.3. Reporting & Alerts
*   Test results, coverage reports, dan status pipeline terlihat langsung di GitHub Actions dashboard.
*   Code coverage metrics akan dilacak seiring waktu untuk memastikan kepatuhan target.

### 5.4. Pre-Commit Hooks
*   Local pre-commit hooks disarankan untuk menjalankan linting dan unit tests sebelum commit, mengurangi kegagalan pipeline.