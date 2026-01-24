# Roadmap: InflationFighter Mobile

## Overview

Convert the Next.js web frontend to a React Native/Expo mobile app. Backend stays unchanged. Each phase delivers testable mobile functionality.

## Phases

- [x] **Phase 1: Expo Project Setup** — Initialize Expo TypeScript with navigation and API client
- [x] **Phase 2: Core Components & Context** — BasketContext + reusable UI components
- [x] **Phase 3: Home Screen** — Category browsing with search
- [x] **Phase 4: Category Detail Screen** — Price comparison table with add to basket
- [x] **Phase 5: Basket Screen** — Optimization analysis and savings display

## Phase Details

### Phase 1: Expo Project Setup
**Goal**: Expo TypeScript project with navigation and backend connection
**Depends on**: Nothing (first phase)
**Success Criteria** (what must be TRUE):
  1. Expo project initialized in `mobile/` with TypeScript template
  2. React Navigation configured with Stack navigator
  3. AsyncStorage package installed
  4. API client configured pointing to backend URL
  5. TypeScript types defined (matching frontend/src/lib/types.ts)
  6. App runs on simulator/emulator
**Plans**: TBD

### Phase 2: Core Components & Context
**Goal**: Reusable components and basket state management
**Depends on**: Phase 1
**Success Criteria** (what must be TRUE):
  1. BasketContext provides add/remove/update/clear functions
  2. Basket state persists to AsyncStorage
  3. Header component shows basket count badge
  4. CategoryCard component displays product with price
  5. AddToBasket component with quantity +/- buttons
  6. SearchBar component with text input
**Plans**: TBD

### Phase 3: Home Screen
**Goal**: Users can browse categories and search
**Depends on**: Phase 2
**Success Criteria** (what must be TRUE):
  1. Home screen fetches and displays all 15 categories
  2. FlatList renders CategoryCard grid (2 columns)
  3. Search filters categories by name
  4. Tapping a card navigates to category detail
  5. Pull-to-refresh reloads categories
  6. Loading state while fetching
**Plans**: TBD

### Phase 4: Category Detail Screen
**Goal**: Price comparison table for individual categories
**Depends on**: Phase 3
**Success Criteria** (what must be TRUE):
  1. Category detail screen shows product name and icon
  2. Displays all 5 store prices ranked cheapest to most expensive
  3. Medal indicators (🥇🥈🥉) for top 3
  4. Add to basket with quantity selector
  5. Back navigation to home
**Plans**: TBD

### Phase 5: Basket Screen
**Goal**: Basket with optimization analysis
**Depends on**: Phase 4
**Success Criteria** (what must be TRUE):
  1. Basket screen lists all items with quantities
  2. Can adjust quantity or remove items
  3. Calls POST /api/basket/analyze with basket items
  4. Displays single-store best option with total
  5. Displays multi-store optimal with breakdown
  6. Shows savings % and annual projection
  7. Clear basket button
**Plans**: TBD

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Expo Project Setup | ✅ Complete | 2025-01-24 |
| 2. Core Components & Context | ✅ Complete | 2025-01-24 |
| 3. Home Screen | ✅ Complete | 2025-01-24 |
| 4. Category Detail Screen | ✅ Complete | 2025-01-24 |
| 5. Basket Screen | ✅ Complete | 2025-01-24 |

---
*Created: 2025-01-24*
*Completed: 2025-01-24*
*Milestone: React Native/Expo Conversion*
