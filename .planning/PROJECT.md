# InflationFighter

## What This Is

A grocery price comparison app that shows Canadians where to shop to save money. Users browse 15 common grocery items, see prices across 5 major stores (No Frills, FreshCo, Walmart, Loblaws, Metro), build a basket, and get optimized shopping strategies — single-store convenience or multi-store maximum savings.

## Core Value

Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

## Current Milestone: v1.2 All Products Page

**Goal:** Add a dedicated "All Products" page that displays every product with images, names, current cheapest price, and historical price changes.

**Target features:**
- All Products page showing all 15 items in a visual grid
- Product images, names, current cheapest price displayed per card
- Price history tracking (previous price vs current price)
- Visual indicator for price changes (up/down)

## Requirements

### Validated

- ✓ Browse 15 product categories with prices from 5 stores — v1.0
- ✓ Search categories by name — v1.0
- ✓ View price comparison for each category — v1.0
- ✓ Add items to basket with quantity — v1.0
- ✓ Basket persists across page refreshes — v1.0
- ✓ Analyze basket optimization — v1.0
- ✓ Mobile-responsive web UI — v1.1

### Active

- [ ] All Products page with visual product grid
- [ ] Display product images on All Products page
- [ ] Show current cheapest price per product
- [ ] Track and display previous prices (price history)
- [ ] Visual price change indicators

### Out of Scope

- Real-time price scraping — legal concerns, manual/hardcoded data for MVP
- User accounts / authentication — not needed for demo
- Store location / proximity routing — adds complexity, not core value
- Price history charts — could be future enhancement, not in v1.2
- Receipt scanning — post-hackathon feature
- Price alerts / notifications — post-hackathon feature

## Context

**Hackathon:** ConUHacks, solo developer

**Demo hook:** "Canadians overpay $1200/year on groceries — we fix that"

**Data approach:** Start with hardcoded realistic prices. Update with real prices from store websites (manual lookup) if time permits.

**Target stores:** No Frills, FreshCo, Walmart, Loblaws, Metro — covers discount, big box, and premium segments in Canadian market.

**Target products:** 15 staples (eggs, milk, bread, butter, apples, bananas, potatoes, onions, chicken, ground beef, pasta, rice, cheese, canned tomatoes, cereal) — items every household buys regularly.

## Constraints

- **Tech stack**: Python FastAPI (backend) + MongoDB Atlas (database) + React/Vite TypeScript (web frontend)
- **Navigation**: React Router for web navigation
- **Storage**: localStorage for basket persistence
- **Deployment**: Railway (backend), Vercel (frontend)
- **Data**: Hardcoded prices acceptable for MVP; no scraping

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Python FastAPI over Node.js backend | Easier JSON handling, quick API development | ✓ Working |
| MongoDB over PostgreSQL | Flexible schema for product data, free Atlas tier | ✓ Working |
| Hardcoded prices for MVP | Avoid legal issues with scraping, faster development | ✓ Working |
| 15 products × 5 stores | Enough variety for compelling demo without data collection overload | ✓ Working |
| Single-store + multi-store optimization | Shows value of both convenience and maximum savings | ✓ Working |
| React/Vite over React Native | Web is simpler than mobile, faster development, easier to demo | ✓ Working |
| Price history in MongoDB | Store previous_prices array per category for history tracking | — Pending |

---
*Last updated: 2026-01-24 — Starting milestone v1.2 All Products Page*
