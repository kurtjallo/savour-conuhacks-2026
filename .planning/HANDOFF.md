# Handoff Context - InflationFighter

**Date:** 2025-01-24
**Status:** MVP Complete, Ready to Run

---

## What Was Built

InflationFighter - a grocery price comparison app for ConUHacks hackathon.

**Features complete:**
- Browse 15 grocery categories with prices from 5 Canadian stores
- Search categories by name
- Price comparison tables ranked cheapest to most expensive (with medals)
- Add to basket with quantity selector
- Basket page with savings analysis:
  - Best single store option
  - Multi-store optimal strategy
  - Savings % and annual projection ($X/year)
- localStorage persistence for basket
- Mobile responsive UI

---

## Tech Stack

- **Backend:** Python FastAPI + MongoDB Atlas
- **Frontend:** Next.js 14 + TypeScript + Tailwind
- **Deployment:** Railway (backend) + Vercel (frontend)

---

## Project Structure

```
groceryPriec/
├── backend/           # FastAPI app
│   ├── main.py        # All API endpoints
│   ├── database.py    # MongoDB connection
│   ├── models.py      # Pydantic models
│   ├── scripts/seed_db.py  # Seed database
│   └── requirements.txt
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Pages (home, basket, category/[id])
│       ├── components/
│       ├── context/BasketContext.tsx
│       └── lib/       # API client + types
├── CLAUDE.md          # Full codebase guide
└── .planning/         # GSD planning files
```

---

## To Run Locally

### 1. Set up MongoDB Atlas
- Create free cluster at https://cloud.mongodb.com
- Get connection string

### 2. Backend
```bash
cd backend
echo "MONGODB_URI=your-connection-string" > .env
pip install -r requirements.txt
python scripts/seed_db.py   # Seed once
uvicorn main:app --reload   # http://localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/stores | List 5 stores |
| GET /api/categories | List 15 categories with cheapest price |
| GET /api/categories/search?q= | Search |
| GET /api/categories/{id} | Price breakdown |
| POST /api/basket/analyze | Basket optimization |

---

## What's NOT Done (Out of Scope)

- User authentication
- Real-time price scraping
- Store locations / routing
- Price history charts
- Deployed to production (user has accounts ready)

---

## Next Steps for User

1. Set up MongoDB Atlas and get connection string
2. Run seed script to populate database
3. Start backend and frontend
4. Test the full flow
5. Deploy to Railway + Vercel when ready

---

## Key Files to Read First

1. `CLAUDE.md` - Full codebase documentation
2. `backend/main.py` - All API logic
3. `frontend/src/app/page.tsx` - Home page
4. `frontend/src/app/basket/page.tsx` - Basket with analysis
5. `frontend/src/context/BasketContext.tsx` - State management
