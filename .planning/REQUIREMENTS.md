# Requirements: InflationFighter

## Overview

Grocery price comparison app for Canadian shoppers. Core value: show exactly how much users save by shopping smarter.

## v1.1 Requirements (Web Migration)

### Cleanup

| ID | Requirement | Priority |
|----|-------------|----------|
| CLN-01 | Remove mobile/ directory and all React Native/Expo code | Must |
| CLN-02 | Update CLAUDE.md for web architecture | Must |

### Frontend Layer (Web)

| ID | Requirement | Priority |
|----|-------------|----------|
| WEB-01 | Initialize React + Vite + TypeScript project in frontend/ | Must |
| WEB-02 | Configure React Router for navigation (Home, Category, Basket) | Must |
| WEB-03 | Create API client (fetch wrapper for backend endpoints) | Must |
| WEB-04 | Create TypeScript types matching backend models | Must |
| WEB-05 | Home page: category grid with search bar | Must |
| WEB-06 | Category card component: icon, name, cheapest price | Must |
| WEB-07 | Category detail page: price comparison table ranked by price | Must |
| WEB-08 | Add to basket with quantity selector | Must |
| WEB-09 | Basket page: list items with quantities, remove/update | Must |
| WEB-10 | Basket analysis: best single store, multi-store optimal, savings | Must |
| WEB-11 | Basket persistence via localStorage | Must |
| WEB-12 | Mobile-responsive layout (Tailwind CSS) | Must |

### Deployment

| ID | Requirement | Priority |
|----|-------------|----------|
| DEP-01 | Frontend deployed on Vercel | Must |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLN-01 | Phase 6 | Pending |
| CLN-02 | Phase 6 | Pending |
| WEB-01 | Phase 7 | Pending |
| WEB-02 | Phase 7 | Pending |
| WEB-03 | Phase 7 | Pending |
| WEB-04 | Phase 7 | Pending |
| WEB-05 | Phase 8 | Pending |
| WEB-06 | Phase 8 | Pending |
| WEB-07 | Phase 8 | Pending |
| WEB-08 | Phase 8 | Pending |
| WEB-09 | Phase 8 | Pending |
| WEB-10 | Phase 8 | Pending |
| WEB-11 | Phase 8 | Pending |
| WEB-12 | Phase 8 | Pending |
| DEP-01 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Last updated: 2026-01-24 — Web migration*
