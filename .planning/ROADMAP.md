# Roadmap: InflationFighter

## Overview

Grocery price comparison app for Canadian shoppers. Browse products, compare prices across stores, build baskets, and see optimized shopping strategies with savings calculations.

## Milestones

- ✅ **v1.0 Mobile App** - Phases 1-5 (completed 2025-01-24)
- ✅ **v1.1 Web Migration** - Phases 6-8 (completed 2026-01-24)
- 🚧 **v1.2 All Products Page** - Phases 9-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 Mobile App (Phases 1-5) - COMPLETED 2025-01-24</summary>

### Phase 1: Expo Project Setup
**Status**: Complete

### Phase 2: Core Components & Context
**Status**: Complete

### Phase 3: Home Screen
**Status**: Complete

### Phase 4: Category Detail Screen
**Status**: Complete

### Phase 5: Basket Screen
**Status**: Complete

</details>

<details>
<summary>✅ v1.1 Web Migration (Phases 6-8) - COMPLETED 2026-01-24</summary>

### Phase 6: Cleanup Mobile
**Goal**: Remove all React Native/Expo code
**Status**: Complete ✅

### Phase 7: Web Foundation
**Goal**: Vite + React + TypeScript + Router + API client working
**Status**: Complete ✅

### Phase 8: Web UI
**Goal**: All screens functional with basket optimization
**Status**: Complete ✅

</details>

### 🚧 v1.2 All Products Page (In Progress)

**Milestone Goal:** Add dedicated All Products page with images, price history tracking

#### Phase 9: Price History Data ✅
**Goal**: Add previous_price field to database and API
**Depends on**: Phase 8
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. ✓ Categories in database have previous_price field
  2. ✓ All 25 categories have sample previous prices seeded
  3. ✓ API returns previous_price in category responses
**Status**: Complete
**Plans**: 1 plan

Plans:
- [x] 09-01: Schema and seed updates

#### Phase 10: All Products Page
**Goal**: Create All Products page with product grid, images, and price display
**Depends on**: Phase 9
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, NAV-01
**Success Criteria** (what must be TRUE):
  1. User can navigate to /products from app navigation
  2. All 15 products display in responsive grid
  3. Each product shows image, name, current cheapest price
  4. Previous price displays with strikethrough styling
  5. UI matches existing app design (Tailwind, colors, spacing)
**Plans**: TBD

Plans:
- [ ] 10-01: All Products page implementation

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1-5 | v1.0 | Complete | 2025-01-24 |
| 6. Cleanup Mobile | v1.1 | Complete | 2026-01-24 |
| 7. Web Foundation | v1.1 | Complete | 2026-01-24 |
| 8. Web UI | v1.1 | Complete | 2026-01-24 |
| 9. Price History Data | v1.2 | Complete | 2026-01-24 |
| 10. All Products Page | v1.2 | Not started | - |

---
*Created: 2026-01-24*
*Last updated: 2026-01-24*
*Current milestone: v1.2 All Products Page*
