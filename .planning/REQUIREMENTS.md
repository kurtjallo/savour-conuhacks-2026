# Requirements: InflationFighter

**Defined:** 2026-01-24
**Core Value:** Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

## v1.2 Requirements (All Products Page)

### Data Layer

- [x] **DATA-01**: Add `previous_price` field to category schema in database
- [x] **DATA-02**: Seed database with sample previous prices for all 25 categories
- [x] **DATA-03**: API returns previous_price in category response

### All Products Page

- [x] **PROD-01**: Create `/products` route in React Router
- [x] **PROD-02**: All Products page displays 15 products in responsive grid
- [x] **PROD-03**: Product card shows product image
- [x] **PROD-04**: Product card shows product name
- [x] **PROD-05**: Product card shows current cheapest price across all stores
- [x] **PROD-06**: Product card shows previous price with strikethrough styling
- [x] **PROD-07**: UI matches existing app design (Tailwind, colors, spacing)

### Navigation

- [x] **NAV-01**: Add "All Products" link to app navigation

## v1.1 Requirements (Web Migration) — Complete

<details>
<summary>Completed v1.1 requirements</summary>

### Cleanup

| ID | Requirement | Status |
|----|-------------|--------|
| CLN-01 | Remove mobile/ directory and all React Native/Expo code | ✓ Complete |
| CLN-02 | Update CLAUDE.md for web architecture | ✓ Complete |

### Frontend Layer (Web)

| ID | Requirement | Status |
|----|-------------|--------|
| WEB-01 | Initialize React + Vite + TypeScript project in frontend/ | ✓ Complete |
| WEB-02 | Configure React Router for navigation (Home, Category, Basket) | ✓ Complete |
| WEB-03 | Create API client (fetch wrapper for backend endpoints) | ✓ Complete |
| WEB-04 | Create TypeScript types matching backend models | ✓ Complete |
| WEB-05 | Home page: category grid with search bar | ✓ Complete |
| WEB-06 | Category card component: icon, name, cheapest price | ✓ Complete |
| WEB-07 | Category detail page: price comparison table ranked by price | ✓ Complete |
| WEB-08 | Add to basket with quantity selector | ✓ Complete |
| WEB-09 | Basket page: list items with quantities, remove/update | ✓ Complete |
| WEB-10 | Basket analysis: best single store, multi-store optimal, savings | ✓ Complete |
| WEB-11 | Basket persistence via localStorage | ✓ Complete |
| WEB-12 | Mobile-responsive layout (Tailwind CSS) | ✓ Complete |

</details>

## Out of Scope

| Feature | Reason |
|---------|--------|
| Price history charts | Future enhancement, not in v1.2 |
| Real-time price scraping | Legal concerns, manual data for MVP |
| User accounts | Not needed for demo |
| Price alerts | Post-hackathon feature |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 9: Price History Data | Complete |
| DATA-02 | Phase 9: Price History Data | Complete |
| DATA-03 | Phase 9: Price History Data | Complete |
| PROD-01 | Phase 10: All Products Page | Complete |
| PROD-02 | Phase 10: All Products Page | Complete |
| PROD-03 | Phase 10: All Products Page | Complete |
| PROD-04 | Phase 10: All Products Page | Complete |
| PROD-05 | Phase 10: All Products Page | Complete |
| PROD-06 | Phase 10: All Products Page | Complete |
| PROD-07 | Phase 10: All Products Page | Complete |
| NAV-01 | Phase 10: All Products Page | Complete |

**Coverage:**
- v1.2 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-24*
*Last updated: 2026-01-24 after v1.2 milestone start*
