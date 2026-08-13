# REQUIREMENTS.md: EcoFlow AI

## Functional Requirements

### User-Facing Modules

**FR-1: Smart Eco-Enzyme Roadmap**
This module SHALL guide users through the initial setup of their eco-enzyme fermentation batch by calculating ideal ingredient ratios.
*   The system SHALL accept organic waste weight (in kilograms) as a primary input from the user.
*   The system SHALL automatically calculate and display the ideal quantities for water (L) and sugar (kg) based on the formula: `Water (L) = Waste (kg) × 3` and `Sugar (kg) = Waste (kg) × 1`.
*   The system SHALL issue a warning and suggest adjustments if the user's intended water or sugar input deviates by more than 10% from the calculated ideal ratio.

**FR-2: AI Fermentation Assistant**
This module SHALL assist users in monitoring their eco-enzyme fermentation process and provide proactive guidance.
*   Users SHALL be able to log daily or weekly fermentation parameters, including aroma (selected from predefined options: sweet, sour, rotten), color (selected from a palette or hex code), gas presence (Yes/No), and temperature (°C).
*   The system SHALL classify the fermentation status as "Normal," "Caution," or "Failed" based on logged data and provide specific, actionable corrective instructions for "Caution" or "Failed" states.
*   The system SHALL trigger a harvest readiness alert when the fermentation period reaches approximately 90 days (±7 days) and the logged parameters indicate optimal conditions for harvesting.

**FR-3: AI Product Recommendation**
This module SHALL recommend suitable derivative products based on the characteristics of the harvested eco-enzyme liquid.
*   Users SHALL be able to confirm harvest and input the final characteristics of the eco-enzyme liquid, including volume (L), color (selected from a palette or hex code), and aroma intensity (on a scale of 1-10).
*   The system SHALL recommend at least 8 derivative products (e.g., Household Cleaner, Disinfectant, Liquid Fertilizer), ranked by a compatibility score (0-100), based on the input liquid characteristics and user's stated purpose (household or UMKM).
*   For each recommended product, the system SHALL display specific processing instructions, including dilution ratios, heating requirements, and recommended storage conditions.

**FR-4: Adaptive Roadmap**
This module SHALL provide step-by-step guidance for processing selected eco-enzyme derivative products.
*   The system SHALL generate a detailed, step-by-step processing guide for a user-selected derivative product, outlining required ingredients, equipment, estimated time, and safety warnings.
*   Users SHALL be able to track their progress through the roadmap milestones and mark checkpoints manually or via image upload for visual verification of completion.
*   The system SHALL provide a downloadable PDF checklist for the roadmap. QR codes/video tutorial links are planned for post-MVP iteration.

**FR-5: Business Analysis (UMKM Orientation)**
This module SHALL provide financial analysis and viability assessment for UMKM operators intending to commercialize eco-enzyme products.
*   UMKM Operators SHALL be able to input commercial parameters such as target production volume (L), target market, packaging type, and distribution channel.
*   The system SHALL automatically calculate and display key financial metrics including Cost of Goods Sold (COGS), a suggested retail price (SRP), gross margin, and break-even units.
*   The system SHALL generate a 12-month profit projection with sensitivity analysis (e.g., ±10% cost variance) and produce a downloadable PDF business viability report with a clear feasibility rating (Viable/Marginal/Not Viable).

**FR-6: User Progress Dashboard**
This module SHALL provide users with an overview of their eco-enzyme activities and impact.
*   The dashboard SHALL display all active fermentation batches with their current status (e.g., "Incubating," "Caution," "Ready for Harvest") and provide quick-access links to their respective logs and roadmaps.
*   The dashboard SHALL visualize the user's cumulative organic waste diverted (in kilograms) and an estimated environmental impact (e.g., CO₂ avoided) based on their recorded activities.
*   The dashboard SHALL list all completed derivative products and their outputs, along with any upcoming milestones or recommended actions for active batches.

### Admin-Facing Modules

**FR-7: Community Monitoring Dashboard**
This module SHALL provide community administrators with aggregated insights into their community's eco-enzyme activities and impact.
*   Community Admins SHALL be able to view aggregated fermentation success rates and the total organic waste processed across all users within their managed communities.
*   The dashboard SHALL display key user engagement metrics, such as log frequency and feature adoption rates, for the community.
*   The system SHALL generate compliance reports suitable for environmental agencies, summarizing community-wide waste reduction and product creation impact.

**FR-8: AI Model Management**
This module SHALL provide Platform Administrators with tools to manage and improve the AI models.
*   Platform Admins SHALL have an interface to initiate retraining of the product recommendation AI model using new, validated user data.
*   The system SHALL provide a dashboard displaying performance metrics for the AI model, including precision, recall, and aggregated user satisfaction ratings for recommendations.
*   Platform Admins SHALL be able to configure and run A/B tests for different recommendation algorithm variants to optimize performance.

**FR-9: Content Management**
This module SHALL enable Platform Administrators to manage the content displayed within the platform.
*   Platform Admins SHALL be able to perform CRUD (Create, Read, Update, Delete) operations on product templates, processing roadmaps, and external tutorial links.
*   The system SHALL support bulk upload functionality for regional market pricing data to be used in the Business Analysis module.
*   The system SHALL maintain version control for all updates made to processing roadmaps and product templates, allowing for rollback if necessary.

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | Response Time for AI recommendations | <2 seconds |
| **Availability** | System Uptime | 99.5% (excluding scheduled maintenance) |
| **Security** | Data Encryption at Rest | AES-256 |
| **Security** | Data Encryption in Transit | TLS 1.3 |
| **Scalability** | Concurrent Users | Support 50,000 concurrent users |
| **Scalability** | Fermentation Logs | Support 10 million fermentation logs |
| **Usability** | Mobile Responsiveness | Full functionality on mobile viewports ≥320px |
| **Usability** | Accessibility Compliance | WCAG 2.1 AA |
| **Data Management** | Data Retention | Configurable retention (RETENTION_DAYS, default 365 days); right-to-erasure deletion |
| **Reliability** | Offline Capability | Log entries and basic roadmap viewing available offline, sync upon connection |
| **Performance** | AI Inference Latency | <500ms for product recommendation on mobile |

## Technical Constraints

*   **Budget:** MVP development SHALL adhere to a budget equivalent to approximately $15,000 USD, aligned with ITechnoCup 2026 competition constraints.
*   **Timeline:** The Minimum Viable Product (MVP) MUST be launched by Q3 2026 to meet the ITechnoCup 2026 competition deadline.
*   **Infrastructure:** The MVP SHALL be deployed on a single Virtual Private Server (VPS) instance (e.g., Hostinger); multi-region deployment is out of scope for this phase.
*   **AI Model:** AI features SHALL be implemented as deterministic rule-based/heuristic services (classification, compatibility scoring, financial calculations) without relying on large language models (LLMs) or external ML runtimes for core functionality. Advanced trained models (scikit-learn/TensorFlow Lite) are planned post-MVP (FR-8).
*   **Regulatory:** The platform MUST comply with Indonesian environmental reporting standards (e.g., SIPSN) and SHALL NOT make medical or pharmaceutical claims for eco-enzyme products.

## Assumptions

*   Users are assumed to have access to a smartphone (Android/iOS) with at least intermittent internet connectivity for data synchronization.
*   Fermentation data input (e.g., aroma, color, temperature) is assumed to be manual, with no IoT sensor integration in the MVP.
*   Regional market pricing data required for the Business Analysis module is assumed to be publicly available or obtainable through partnerships with relevant agencies.
*   Community leaders and environmental organizations are assumed to actively promote and support platform adoption within their respective communities.
*   Firebase Authentication services are assumed to be stable and reliably available within the Indonesia region.