# Roadmap: InflationFighter

## Overview

Build a grocery price comparison app in ~23 hours for ConUHacks. Start with data and backend, build frontend progressively, deploy and polish for demo. Each phase delivers something testable.

## Phases

- [ ] **Phase 1: Data Setup** — MongoDB + seed data for 5 stores and 15 products
- [ ] **Phase 2: Backend API** — FastAPI with all 5 endpoints
- [ ] **Phase 3: Frontend Browse** — Home page, category grid, price comparison
- [ ] **Phase 4: Basket Optimization** — Basket builder with savings analysis
- [ ] **Phase 5: Deploy & Polish** — Railway + Vercel deployment, mobile responsive

## Phase Details

### Phase 1: Data Setup
**Goal**: MongoDB Atlas connected with stores and categories collections populated
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. MongoDB Atlas cluster accessible from local development
  2. `stores` collection has 5 store documents with name, color, store_id
  3. `categories` collection has 15 product documents with prices from all 5 stores
  4. Can query data via MongoDB Compass or shell
**Plans**: TBD

### Phase 2: Backend API
**Goal**: FastAPI server with all endpoints returning real data from MongoDB
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. GET /api/stores returns all 5 stores
  2. GET /api/categories returns all 15 categories with cheapest price calculated
  3. GET /api/categories/search?q=eggs returns matching categories
  4. GET /api/categories/{id} returns full price breakdown ranked by price
  5. POST /api/basket/analyze returns single-store best, multi-store optimal, and savings
**Plans**: TBD

### Phase 3: Frontend Browse
**Goal**: Users can browse categories and see price comparisons
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Home page renders with hero and search bar
  2. Category grid displays all 15 categories as cards
  3. Each card shows icon, name, cheapest price, savings %
  4. Clicking a card shows full price comparison table
  5. "Add to basket" button works with quantity selector
**Plans**: TBD

### Phase 4: Basket Optimization
**Goal**: Users can build a basket and see optimized shopping strategies
**Depends on**: Phase 3
**Requirements**: UI-06, UI-07, UI-08, UI-09, UI-10
**Success Criteria** (what must be TRUE):
  1. Basket page shows all added items with quantities
  2. Analysis displays: best single store, multi-store optimal, worst case
  3. Savings percentage and annual projection displayed prominently
  4. Basket persists across page refreshes (localStorage)
  5. UI works on mobile viewport
**Plans**: TBD

### Phase 5: Deploy & Polish
**Goal**: Live app accessible via public URLs, demo-ready
**Depends on**: Phase 4
**Requirements**: DEP-01, DEP-02, DEP-03
**Success Criteria** (what must be TRUE):
  1. Backend running on Railway with public URL
  2. Frontend running on Vercel with public URL
  3. Frontend successfully calls Railway backend
  4. Full user flow works: browse → add to basket → see savings
  5. No console errors, loading states work, mobile responsive
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Setup | 0/TBD | Not started | - |
| 2. Backend API | 0/TBD | Not started | - |
| 3. Frontend Browse | 0/TBD | Not started | - |
| 4. Basket Optimization | 0/TBD | Not started | - |
| 5. Deploy & Polish | 0/TBD | Not started | - |
