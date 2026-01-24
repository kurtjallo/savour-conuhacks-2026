# InflationFighter

## What This Is

A grocery price comparison app that shows Canadians where to shop to save money. Users browse 15 common grocery items, see prices across 5 major stores (No Frills, FreshCo, Walmart, Loblaws, Metro), build a basket, and get optimized shopping strategies — single-store convenience or multi-store maximum savings.

## Core Value

Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Browse 15 product categories with prices from 5 stores
- [ ] Search categories by name
- [ ] View price comparison for each category (ranked cheapest to most expensive)
- [ ] Add items to basket with quantity
- [ ] Basket persists across page refreshes (localStorage)
- [ ] Analyze basket: best single store vs multi-store optimal vs worst case
- [ ] Calculate savings percentage and annual savings projection
- [ ] Mobile-responsive UI for demo flexibility

### Out of Scope

- Real-time price scraping — legal concerns, manual/hardcoded data for MVP
- User accounts / authentication — not needed for demo
- Store location / proximity routing — adds complexity, not core value
- Price history charts — stretch goal, cut for time
- Receipt scanning — post-hackathon feature
- Price alerts / notifications — post-hackathon feature

## Context

**Hackathon:** ConUHacks, ~23 hours remaining, solo developer

**Demo hook:** "Canadians overpay $1200/year on groceries — we fix that"

**Data approach:** Start with hardcoded realistic prices. Update with real prices from store websites (manual lookup) if time permits.

**Target stores:** No Frills, FreshCo, Walmart, Loblaws, Metro — covers discount, big box, and premium segments in Canadian market.

**Target products:** 15 staples (eggs, milk, bread, butter, apples, bananas, potatoes, onions, chicken, ground beef, pasta, rice, cheese, canned tomatoes, cereal) — items every household buys regularly.

## Constraints

- **Tech stack**: Python FastAPI (backend) + MongoDB Atlas (database) + Next.js + Tailwind (frontend) — chosen for rapid development and free hosting tiers
- **Timeline**: ~23 hours total, demo-ready required
- **Deployment**: Railway (backend), Vercel (frontend), MongoDB Atlas (database) — all accounts already configured
- **Solo developer**: Sequential work only, no parallelization of human effort
- **Data**: Hardcoded prices acceptable for MVP; no scraping

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Python FastAPI over Node.js backend | Easier JSON handling, quick API development | — Pending |
| MongoDB over PostgreSQL | Flexible schema for product data, free Atlas tier | — Pending |
| Hardcoded prices for MVP | Avoid legal issues with scraping, faster development | — Pending |
| 15 products × 5 stores | Enough variety for compelling demo without data collection overload | — Pending |
| Single-store + multi-store optimization | Shows value of both convenience and maximum savings | — Pending |

---
*Last updated: 2025-01-24 after initialization*
