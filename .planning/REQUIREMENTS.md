# Requirements: InflationFighter

## Overview

Grocery price comparison app for Canadian shoppers. Core value: show exactly how much users save by shopping smarter.

## v1 Requirements (Hackathon MVP)

### Data Layer

| ID | Requirement | Priority |
|----|-------------|----------|
| DATA-01 | Store 5 stores with metadata (name, color, logo) | Must |
| DATA-02 | Store 15 product categories with prices from all 5 stores | Must |
| DATA-03 | Each category has: name, icon, unit, search terms, price per store | Must |

### API Layer

| ID | Requirement | Priority |
|----|-------------|----------|
| API-01 | GET /api/stores — list all stores | Must |
| API-02 | GET /api/categories — list all categories with cheapest price info | Must |
| API-03 | GET /api/categories/search?q= — search categories by name | Must |
| API-04 | GET /api/categories/{id} — full price breakdown for one category | Must |
| API-05 | POST /api/basket/analyze — basket optimization (single-store vs multi-store) | Must |

### Frontend Layer

| ID | Requirement | Priority |
|----|-------------|----------|
| UI-01 | Home page: hero section with search bar | Must |
| UI-02 | Category grid: browse all 15 categories | Must |
| UI-03 | Category card: shows icon, name, cheapest price, savings % | Must |
| UI-04 | Category detail: price comparison table ranked by price | Must |
| UI-05 | Add to basket with quantity selector | Must |
| UI-06 | Basket page: list items with quantities | Must |
| UI-07 | Basket analysis: best single store, multi-store optimal, worst case | Must |
| UI-08 | Savings callout: percentage and annual projection | Must |
| UI-09 | Basket persists via localStorage | Must |
| UI-10 | Mobile-responsive layout | Must |

### Deployment

| ID | Requirement | Priority |
|----|-------------|----------|
| DEP-01 | Backend deployed on Railway | Must |
| DEP-02 | Frontend deployed on Vercel | Must |
| DEP-03 | MongoDB Atlas connection working in production | Must |

## v2 Requirements (Post-Hackathon)

| ID | Requirement | Notes |
|----|-------------|-------|
| v2-01 | Real-time price data via API partnerships | Replace hardcoded data |
| v2-02 | Price history charts | Shrinkflation detection |
| v2-03 | Price alerts / notifications | "Notify when eggs < $4" |
| v2-04 | Receipt scanning | Track actual purchases |
| v2-05 | Store flyer integration | Weekly deals |

## Out of Scope

- User accounts / authentication — not needed for demo
- Store location / proximity routing — adds complexity
- Real-time scraping — legal concerns

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| API-05 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |
| UI-06 | Phase 4 | Pending |
| UI-07 | Phase 4 | Pending |
| UI-08 | Phase 4 | Pending |
| UI-09 | Phase 4 | Pending |
| UI-10 | Phase 4 | Pending |
| DEP-01 | Phase 5 | Pending |
| DEP-02 | Phase 5 | Pending |
| DEP-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Last updated: 2025-01-24 after roadmap creation*
