# EcoFlow AI - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **P1 Features (Q4 2026)**:
  - PDF Export functionality for batch reports with print-friendly styling
  - Community Analytics & Sharing UI at `/dashboard/community`
  - Environmental Impact Tracking panel with CO₂, water, and tree equivalents
  - PWA Configuration with `manifest.json` and meta tags
  - IoT Sensors Webhook endpoint at `/api/v1/sensors/webhook`
  
- **P2 Features (Q1 2027)**:
  - Multi-language support (EN/ID) with i18n context provider
  - Batch Comparison Analytics at `/dashboard/compare` with Recharts visualizations
  - Enhanced offline-first sync with localforage and retry mechanism
  - Auto-sync on network reconnection

### Changed
- Repository cleanup: Archived 32 documentation .md files to `docs/archive/`
- Root directory now only contains `README.md`, `CHANGELOG.md`, and `CONTRIBUTING.md`
- Backend CORS now accepts wildcard origins for development

---

## [1.0.0] - 2026-08-13

### Added
- **Warm Organic Design System**:
  - Forest Green (#15803D) primary color
  - Molasses Amber (#D97706) accent color
  - Soft Cream (#FDFBF7) background
  - Complete landing page redesign with warm palette

- **Clean Code Architecture**:
  - Frontend restructure: `src/components/{ui,layout,features}`
  - Backend restructure: `app/api/` for endpoint separation
  - Organized hooks, services, and types directories

- **Backend Improvements**:
  - CORS wildcard configuration for development
  - Enhanced error handling with fallback empty arrays
  - Improved API timeout handling (10s)

- **Documentation**:
  - Professional README.md (530 lines) with:
    - Tech stack badges
    - Comprehensive folder tree structure
    - API endpoints summary table
    - Quick Start guide with Docker
    - Testing instructions
    - Design system documentation
    - Troubleshooting section

### Changed
- Landing page from dark cyberpunk theme to warm organic theme
- Global CSS variables for warm color palette
- Navigation and CTA buttons styling

---

## [0.1.0] - 2026-08-10

### Added
- Initial MVP release for ITechnoCup 2026
- AI-powered fermentation monitoring
- Product recommendation engine
- Business analysis dashboard
- Batch management system
- Firebase authentication
- PostgreSQL database with Alembic migrations
- Admin dashboard
- Environmental impact metrics
- PDF export for reports and roadmaps

### Features
- Next.js 15 with App Router
- FastAPI backend with Python 3.14
- Tailwind CSS 4.0 styling
- Firebase Auth integration
- Real-time monitoring with AI predictions
- 8 product templates (Household Cleaner, Fertilizer, etc.)
- COGS calculation and profit projections
- Offline queue for fermentation logs
- E2E testing with Playwright (17 tests passing)

---

## Legend
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

---

**EcoFlow AI © 2026** - Smart Eco-Enzyme Fermentation Assistant
