# ROADMAP.md: EcoFlow AI

## Phased Delivery Plan

This roadmap outlines the planned phases for the EcoFlow AI platform, from initial design to post-launch iteration.

| Phase | Duration | Goals |
|:---|:---|:---|
| **0: Inception & Design** | Q4 2025 (3 months) | Finalize UI/UX designs, establish data models, define AI architecture, complete API specifications. |
| **1: MVP Development** | Q1-Q2 2026 (6 months) | Implement core P0 features, develop robust backend services, integrate initial AI models, set up infrastructure. |
| **2: Beta & Launch** | Q3 2026 (3 months) | Conduct closed beta testing with target users, gather feedback, perform bug fixing, prepare for public MVP launch and ITechnoCup 2026 submission. |
| **3: Post-Launch & Iteration** | Q4 2026 onwards (Ongoing) | Address critical bugs, implement P1 features, continuously gather user feedback, plan for subsequent versions (v1.1+). |

*Disclaimer: Timeline assumes a team of 3-5 developers. Adjust proportionally for different team sizes.*

## MVP Feature List

This section details the Minimum Viable Product (MVP) features, categorized by priority for phased delivery. For detailed feature descriptions, refer to [PRD.md](PRD.md) and [REQUIREMENTS.md](REQUIREMENTS.md).

### P0: Must Have for Launch (Q3 2026)

These features are essential for the initial public release and ITechnoCup 2026 submission.

*   **FR-1: Smart Eco-Enzyme Roadmap:** Core functionality for calculating ideal ingredient ratios based on organic waste input.
*   **FR-2: AI Fermentation Assistant:** Basic logging of fermentation parameters (aroma, color, gas) and initial rule-based status classification (Normal/Caution/Failed).
*   **FR-3: AI Product Recommendation:** Initial version providing product recommendations based on basic harvest characteristics.
*   **FR-5: Business Analysis:** Core financial calculations (COGS, SRP, gross margin) for UMKM users.
*   **FR-6: User Progress Dashboard:** Display active fermentation batches, completed products, and basic cumulative waste diverted.
*   **User Authentication:** Secure user registration and login via Firebase Auth.
*   **Basic Admin Dashboard:** Limited view for platform administrators to monitor system health and user activity.

### P1: Should Have within 1 Month Post-Launch (Q4 2026)

These features enhance the user experience and platform utility shortly after the initial launch.

*   **FR-4: Adaptive Roadmap:** Full step-by-step processing guides for selected derivative products, including downloadable PDFs and links to video tutorials. *(PDF checklist ✅ shipped; video tutorial links: planned)*
*   **FR-5: Business Analysis:** Enhanced reporting with 12-month profit projection and sensitivity analysis. *(✅ 12-month projection & sensitivity analysis shipped)*
*   **FR-6: User Progress Dashboard:** Visualization of estimated environmental impact (CO₂ avoided) and more detailed historical data. *(✅ shipped)*
*   **FR-7: Community Monitoring Dashboard:** Basic aggregation of fermentation success rates and total waste processed by community. *(✅ shipped: community stats, trends, CSV compliance export)*
*   **FR-9: Content Management:** Interface for managing product templates and processing roadmap content. *(✅ shipped: admin CRUD, templates now drive the recommendation engine via DB)*

### P2: Nice to Have for Future (Q1 2027 onwards)

These features are planned for subsequent iterations based on user feedback and strategic growth.

*   **FR-2: AI Fermentation Assistant:** Advanced ML confidence scoring, proactive corrective action suggestions based on ML.
*   **FR-8: AI Model Management:** Interface for retraining and A/B testing recommendation algorithms.
*   **FR-9: Content Management:** Bulk upload capability for regional market pricing data, version control for roadmap updates.
*   **Advanced Analytics:** Deeper insights into user behavior and environmental impact.
*   **Expanded Product Templates:** Support for more diverse eco-enzyme derivative products.
*   Features explicitly listed as "Out of Scope (Version 1.0)" in [PRD.md](PRD.md).

## Milestones

Key project milestones with target dates and deliverables.

| Milestone | Phase | Target Date | Deliverables | Status |
|:---|:---|:---|:---|:---|
| **1: Design Completion** | 0 | End Q4 2025 | Finalized UI/UX mockups, complete database schema, detailed API contracts, AI model architecture. | ✅ Selesai |
| **2: Core Backend & Auth** | 1 | End Q1 2026 | Functional user authentication, secure data storage for FR-1, FR-2, FR-6, core API endpoints implemented. | ✅ Selesai |
| **3: AI Engine MVP** | 1 | Mid Q2 2026 | Initial AI models for FR-2 (rule-based) and FR-3 (basic recommendation) integrated, FR-5 core calculations functional. | ✅ Selesai |
| **4: Closed Beta Ready** | 2 | End Q2 2026 | All P0 features deployed to staging environment, beta user onboarding process established, initial test data loaded. | ✅ Selesai |
| **5: Public MVP Launch** | 2 | Mid Q3 2026 | P0 features live in production, platform submitted for ITechnoCup 2026 competition, initial marketing efforts. | 🔄 Dalam proses (submission Aug 4, 2026) |
| **6: P1 Features Release** | 3 | End Q4 2026 | FR-4, enhanced FR-5, FR-6, FR-7, FR-9 features deployed to production, user feedback incorporated. | ⏳ Pasca-launch |

## Dependencies

### External Dependencies

These are external services, accounts, or data sources required for the project.

*   **Firebase Authentication:** Account setup and API keys for user authentication.
*   **Hostinger VPS:** Provisioned and configured Virtual Private Server for hosting backend and database.
*   **MinIO Storage:** Configured S3-compatible object storage for user-uploaded images and generated PDFs.
*   **Public Market Data:** Access to regional market pricing data for business analysis (FR-5).
*   **ITechnoCup 2026 Competition:** Adherence to competition guidelines, submission deadlines, and technical requirements.
*   **Legal & Compliance:** Review and approval of Terms of Service, Privacy Policy, and environmental reporting compliance.

### Internal Dependencies

These are deliverables from other project streams or internal teams.

*   **UI/UX Designs:** Completed high-fidelity mockups and prototypes from the design team (output of Phase 0).
*   **API Specifications:** Finalized API contracts and documentation for frontend-backend communication (output of Phase 0).
*   **AI Model Training Data:** Curated and labeled datasets for training initial AI models (for FR-2, FR-3).
*   **Content for Roadmaps:** Detailed step-by-step guides, ingredient lists, and safety warnings for derivative products (for FR-4).
*   **Video Tutorials:** Links to external video tutorials for adaptive roadmaps (for FR-4).

## Risks & Mitigation

This section outlines potential risks, their impact, probability, and planned mitigation strategies. For a more detailed analysis, see [PRD.md](PRD.md).

| Risk | Impact | Probability | Mitigation |
|:---|:---|:---|:---|
| **AI Model Bias** | Recommendations fail for regional fermentation variations | Medium | Collect diverse fermentation data; implement regional model variants; quarterly retraining with user feedback. |
| **User Data Privacy Breach** | Loss of trust; regulatory penalties (GDPR/GDPR-equivalent) | Low | End-to-end encryption; regular penetration testing; SOC 2 Type II audit by Year 2. |
| **Fermentation Failure Liability** | User blames platform for failed batches; reputational damage | Medium | Explicit disclaimer in ToS; AI confidence scoring with uncertainty quantification; community support forum. |
| **Adoption Barrier (Rural Connectivity)** | Low uptake in target communities | Medium | Offline-first architecture; SMS-based log submission fallback; partner with community leaders for training. |
| **Competitive Pressure** | Larger agritech platforms enter eco-enzyme space | Low | First-mover advantage; deep integration with waste management agencies; community lock-in via social impact narrative. |
| **Hosting Scalability Bottleneck** | Performance degradation at 10K+ concurrent users | Medium | Implement caching layer (Redis); database query optimization; migration plan to Kubernetes by Year 2. |