# PRD: EcoFlow AI

## Executive Summary & Product Vision

EcoFlow AI is an AI-powered SaaS platform designed to optimize the post-fermentation lifecycle of eco-enzyme production, transforming organic waste into commercially viable products. The platform addresses Indonesia's waste crisis (27.74 million tons annually, 40% food waste) by guiding households and micro-enterprises through eco-enzyme fermentation, harvest assessment, product derivation, and business viability analysis.

**Core Value Proposition:**
- Eliminates post-harvest confusion through AI-driven decision assistance
- Converts fermentation data into actionable product recommendations
- Enables UMKM financial modeling and business case validation
- Reduces organic waste burden on TPA through optimized household-level intervention

**Target Launch:** MVP by Q3 2026 (ITechnoCup 2026 competition deadline)

---

## Problem Statement & Target Users

### Problem
1. **Knowledge Gap:** 40% of food waste in Indonesia lacks upstream intervention; eco-enzyme fermentation is known but post-harvest processing is opaque
2. **Decision Paralysis:** Users complete fermentation but lack guidance on product derivation, processing steps, and economic viability
3. **Waste of Potential:** Successful fermentations are discarded or underutilized due to lack of market-ready product pathways
4. **UMKM Barrier:** Micro-enterprises cannot perform rapid financial feasibility analysis for eco-enzyme derivatives

### Target Users

| User Segment | Primary Need | Secondary Need |
|:---|:---|:---|
| Household Practitioners | Fermentation guidance + product clarity | Environmental impact tracking |
| UMKM Operators | Business viability + cost modeling | Supply chain optimization |
| Community Leaders | Batch monitoring + reporting | Waste reduction metrics |
| Environmental Officers | Aggregated impact data | Compliance documentation |

---

## System Scope & User Roles

### Functional Scope (In-Scope)
- Eco-enzyme fermentation lifecycle management (input through harvest)
- AI-driven product recommendation engine
- Adaptive processing roadmaps for 8+ derivative products
- Financial modeling for commercial orientation
- User progress tracking and historical data retention

### User Roles & Permissions Matrix

| Role | Fermentation Log | Product Recommendation | Business Analysis | Admin Dashboard | Export Reports |
|:---|:---|:---|:---|:---|:---|
| Household User | Create/Edit | View | View (Read-Only) | — | PDF Only |
| UMKM Operator | Create/Edit | View | Create/Edit | — | Full Export |
| Community Admin | View All | View All | View All | Limited | Full Export |
| Platform Admin | View All | Manage | Manage | Full Access | Full Access |

---

## Functional Requirements

### User-Facing Features

**FR-1: Smart Eco-Enzyme Roadmap**
- Accept organic waste weight (kg) as primary input
- Auto-calculate ideal water-to-sugar ratio using embedded formula: `Water (L) = Waste (kg) × 3; Sugar (kg) = Waste (kg) × 1`
- Display ingredient checklist with visual progress tracking
- Provide fail-safe warnings if ratios deviate >10% from calculated ideal
- Store calculation history for batch comparison

**FR-2: AI Fermentation Assistant**
- Accept daily/weekly fermentation logs via hybrid input (text + image upload)
- Log parameters: aroma (dropdown: sweet/sour/rotten), color (hex picker or preset), gas presence (yes/no), temperature (°C)
- Classify fermentation status (Normal/Caution/Failed) using rule-based logic + ML confidence scoring
- Proactively suggest corrective actions (e.g., "Add 50g sugar if pH drops below 3.5")
- Generate fermentation health score (0–100) visible on dashboard
- Trigger harvest readiness alert when fermentation reaches optimal state (day 90±7)

**FR-3: AI Product Recommendation**
- Accept harvest confirmation + final liquid characteristics (volume, color, aroma intensity 1–10)
- Match characteristics against 8 product templates: Household Cleaner, Disinfectant, Liquid Fertilizer, Pest Repellent, Drain Cleaner, Odor Neutralizer, Cosmetic Base, Animal Feed Additive
- Rank recommendations by compatibility score (0–100) based on fermentation quality metrics
- Display product-specific processing instructions (dilution ratios, heating requirements, storage conditions)
- Allow user to select preferred product or request alternative recommendations

**FR-4: Adaptive Roadmap**
- Generate step-by-step processing guide for selected product derivative
- Include ingredient lists, equipment requirements, time estimates, and safety warnings
- Provide downloadable PDF checklist (QR codes/video tutorial links direncanakan untuk iterasi berikutnya)
- Track user progress through roadmap milestones
- Allow manual checkpoint marking or auto-detection via image upload (for visual verification)

**FR-5: Business Analysis (UMKM Orientation)**
- Accept commercial inputs: production volume (L), target market, packaging type, distribution channel
- Auto-calculate: Cost of Goods Sold (COGS), suggested retail price (SRP), gross margin, break-even units
- Generate 12-month profit projection with sensitivity analysis (±10% cost variance)
- Produce business viability report (PDF) with feasibility rating (Viable/Marginal/Not Viable)
- Benchmark against regional market data (if available)

**FR-6: User Progress Dashboard**
- Display active fermentation batches with status badges
- Show completed products and derivative outputs
- Visualize cumulative waste diverted (kg) and estimated environmental impact (CO₂ avoided)
- List upcoming milestones and recommended actions
- Provide quick-access links to relevant roadmaps and logs

### Admin-Facing Features

**FR-7: Community Monitoring Dashboard**
- Aggregate fermentation success rates by region/community
- Display total waste processed and products created
- Monitor user engagement metrics (log frequency, feature adoption)
- Generate compliance reports for environmental agencies

**FR-8: AI Model Management**
- Interface to retrain product recommendation model with new user data
- A/B testing framework for recommendation algorithm variants
- Performance metrics dashboard (precision, recall, user satisfaction)

**FR-9: Content Management**
- CRUD operations for product templates, processing roadmaps, and tutorial links
- Bulk upload capability for regional market pricing data
- Version control for roadmap updates

---

## Non-Functional Requirements

| Requirement | Target | Rationale |
|:---|:---|:---|
| **Response Time** | <2s for recommendation queries | Real-time decision support expectation |
| **Availability** | 99.5% uptime | SaaS reliability standard; offline mode for log entry |
| **Data Security** | AES-256 encryption at rest; TLS 1.3 in transit | User fermentation data is proprietary |
| **Scalability** | Support 50K concurrent users; 10M fermentation logs | Projected 5-year growth target |
| **Mobile Responsiveness** | Full functionality on iOS/Android (viewport ≥320px) | Primary user access via smartphone |
| **Accessibility** | WCAG 2.1 AA compliance | Inclusive design for diverse literacy levels |
| **Data Retention** | Retention cleanup configurable (`RETENTION_DAYS`, default 365 hari); right-to-erasure deletion per user | Regulatory + user analysis needs |
| **Offline Capability** | Log entry sync when connection restored | Rural connectivity constraints |
| **AI Inference Latency** | <500ms for product recommendation | Mobile UX tolerance threshold |

---

## Technology Stack & Rationale

| Component | Technology | Why |
|:---|:---|:---|
| **Frontend** | React + Next.js | SSR for SEO; component reusability; eco-friendly educational UI library (Chakra UI) |
| **Backend** | Python FastAPI | Rapid prototyping; native ML integration; async I/O for concurrent fermentation logs |
| **Database** | PostgreSQL | ACID compliance for financial calculations; JSONB for flexible fermentation log schema; proven scalability |
| **AI/ML** | Heuristic services (rule-based classification, scoring, deterministic finance) | Rencana pasca-MVP: TensorFlow Lite edge inference; scikit-learn model terlatih (FR-8) |
| **Hosting** | Hostinger VPS | Cost-effective for MVP; scalable to managed Kubernetes if needed; Indonesia-based latency advantage |
| **Storage** | MinIO (S3-compatible) | Self-hosted object storage; cost control; image/PDF versioning for fermentation logs |
| **Authentication** | Firebase Auth | Passwordless SMS/email; multi-factor support; no backend auth infrastructure overhead |
| **Monitoring** | Prometheus + Grafana | Open-source; VPS-native deployment; real-time alerting for model drift |

---

## Success Metrics & KPIs

| KPI | Target (Year 1) | Measurement Method |
|:---|:---|:---|
| **User Acquisition** | 5,000 active users | Monthly active users (MAU) |
| **Fermentation Success Rate** | ≥85% (vs. 60% baseline) | Completed fermentations / Started fermentations |
| **Product Derivation Rate** | ≥70% of harvests → derivative products | Roadmap completions / Recommendations accepted |
| **Waste Diversion** | 500 tons organic waste processed | Aggregated user input data |
| **UMKM Adoption** | 200 micro-enterprises | Registered UMKM-tier accounts |
| **Feature Engagement** | Business Analysis used by 40% of UMKM | Feature adoption tracking |
| **User Satisfaction** | NPS ≥50 | Quarterly in-app survey |
| **AI Recommendation Accuracy** | ≥80% user satisfaction with suggestions | Post-recommendation feedback rating |

---

## Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|:---|:---|:---|:---|
| **AI Model Bias** | Recommendations fail for regional fermentation variations | Medium | Collect diverse fermentation data; implement regional model variants; quarterly retraining with user feedback |
| **User Data Privacy Breach** | Loss of trust; regulatory penalties (GDPR/GDPR-equivalent) | Low | End-to-end encryption; regular penetration testing; SOC 2 Type II audit by Year 2 |
| **Fermentation Failure Liability** | User blames platform for failed batches; reputational damage | Medium | Explicit disclaimer in ToS; AI confidence scoring with uncertainty quantification; community support forum |
| **Adoption Barrier (Rural Connectivity)** | Low uptake in target communities | Medium | Offline-first architecture; SMS-based log submission fallback; partner with community leaders for training |
| **Competitive Pressure** | Larger agritech platforms enter eco-enzyme space | Low | First-mover advantage; deep integration with waste management agencies; community lock-in via social impact narrative |
| **Hosting Scalability Bottleneck** | Performance degradation at 10K+ concurrent users | Medium | Implement caching layer (Redis); database query optimization; migration plan to Kubernetes by Year 2 |

---

## Constraints & Assumptions

### Constraints
- **Budget:** MVP development within ITechnoCup 2026 competition constraints (~$15K USD equivalent)
- **Timeline:** MVP launch by Q3 2026
- **Infrastructure:** Single VPS instance (Hostinger) for MVP; no multi-region deployment
- **AI Model:** Rule-based + lightweight ML (no large language models); inference must run on-device for mobile
- **Regulatory:** Compliance with Indonesian environmental reporting standards (SIPSN); no medical/pharmaceutical claims for products

### Assumptions
- Users have smartphone access (Android/iOS) with intermittent internet connectivity
- Fermentation data input is manual (no IoT sensors in MVP)
- Regional market pricing data is available via public sources or partner agencies
- Community leaders will actively promote platform adoption
- Firebase Auth availability in Indonesia region is stable

---

## Out of Scope (Version 1.0)

- **IoT Integration:** Real-time sensor data (temperature, pH, gas sensors) — deferred to v2.0
- **Supply Chain Management:** Supplier sourcing, inventory tracking, logistics optimization
- **E-Commerce Integration:** Direct product sales marketplace; payment gateway integration
- **Advanced Analytics:** Predictive modeling for crop yields, climate impact forecasting
- **Multi-Language Support:** Initial launch in Indonesian only; English support in v1.1
- **Blockchain/Traceability:** Product origin verification and NFT certification
- **API Marketplace:** Third-party developer integrations
- **Video Streaming:** Embedded tutorial videos (external links only in v1.0)
- **Batch Collaboration:** Multi-user fermentation batch management (single-user focus in MVP)

---

## Deliverables & Timeline

| Phase | Deliverable | Target Date |
|:---|:---|:---|
| **Design** | UI/UX mockups; data schema; AI model architecture | Q4 2025 |
| **MVP Development** | Core 5 features; basic admin dashboard | Q2 2026 |
| **Closed Beta** | Testing with 50 household + 10 UMKM users | Q2 2026 |
| **Launch** | Public MVP release; ITechnoCup 2026 submission | Q3 2026 |
| **Post-Launch** | Bug fixes; user feedback iteration; v1.1 planning | Q4 2026 |