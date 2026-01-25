# CLAUDE.md - InflationFighter Codebase Guide

## Project Overview

InflationFighter is a grocery price comparison web app for Canadian shoppers. Users browse 100 common grocery items, compare prices across 5 major stores, build a basket, and see optimized shopping strategies with savings calculations.

**Core value:** Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

**Product catalog:** 100 essential grocery items across categories (dairy, produce, meat, pantry staples, frozen foods, beverages, snacks, etc.)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python FastAPI |
| Database | MongoDB Atlas |
| Frontend | React + TypeScript (Vite) |
| Deployment | Railway (backend) + Vercel/Netlify (frontend) |

## Project Structure

```
groceryPriec/
├── backend/
│   ├── main.py              # FastAPI app with all endpoints
│   ├── database.py          # MongoDB connection via Motor
│   ├── models.py            # Pydantic models
│   ├── requirements.txt     # Python dependencies
│   ├── scripts/
│   │   └── seed_db.py       # Database seeding script
│   └── Procfile             # Railway deployment
├── frontend/
│   ├── index.html           # Vite entry point
│   ├── vite.config.ts       # Vite configuration
│   ├── src/
│   │   ├── main.tsx         # React app entry
│   │   ├── App.tsx          # Main app with routing
│   │   ├── pages/
│   │   │   ├── HomePage.tsx        # Category grid + search
│   │   │   ├── CategoryPage.tsx    # Price comparison table
│   │   │   └── BasketPage.tsx      # Basket with optimization
│   │   ├── components/
│   │   │   ├── CategoryCard.tsx    # Product card
│   │   │   ├── SearchBar.tsx       # Search input
│   │   │   └── AddToBasket.tsx     # Quantity selector
│   │   ├── context/
│   │   │   └── BasketContext.tsx   # Basket state + localStorage
│   │   ├── lib/
│   │   │   ├── api.ts              # API client functions
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   ├── icons.ts            # Emoji icon mapping
│   │   │   └── theme.ts            # Colors, spacing, fonts
│   │   └── styles/
│   │       └── index.css           # Global styles
│   ├── package.json
│   └── tsconfig.json
└── .planning/                       # GSD planning files
```

## Running the App

### Backend
```bash
cd backend
cp .env.example .env  # Add your MongoDB URI
pip install -r requirements.txt
python scripts/seed_db.py  # Seed database (once)
uvicorn main:app --reload  # Runs on :8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on :5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all 5 stores |
| GET | `/api/categories` | List 15 categories with cheapest price |
| GET | `/api/categories/search?q=` | Search categories by name |
| GET | `/api/categories/{id}` | Full price breakdown for one category |
| POST | `/api/basket/analyze` | Basket optimization analysis |

### Basket Analysis Request
```json
{
  "items": [
    { "category_id": "eggs", "quantity": 2 },
    { "category_id": "milk", "quantity": 1 }
  ]
}
```

### Basket Analysis Response
Returns `single_store_best`, `single_store_worst`, `multi_store_optimal`, `savings_vs_worst`, `savings_percent`, `annual_projection`.

## Data Model

### Stores (5 total)
- No Frills, FreshCo, Walmart, Loblaws, Metro
- Fields: `store_id`, `name`, `color`

### Categories (100 products)
- Essential groceries: eggs, milk, bread, butter, produce (fruits & vegetables), meats, seafood, pasta, rice, flour, sugar, oil
- Pantry staples: condiments, spices, canned goods, baking supplies, grains
- Frozen foods, snacks, beverages, breakfast items, deli items
- Fields: `category_id`, `name`, `icon`, `unit`, `search_terms`, `prices` (object with store_id → price)

## Key Patterns

1. **Basket persistence**: Uses localStorage via BasketContext
2. **API base URL**: Configured in `frontend/src/lib/api.ts` (localhost:8000 for dev)
3. **Price calculations**: Cheapest/most expensive computed on the fly from prices object
4. **Icons**: Mapped from icon string to emoji in `frontend/src/lib/icons.ts`
5. **Routing**: React Router with routes (/ → /category/:id → /basket)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
```

### Frontend
API_BASE is configured in `frontend/src/lib/api.ts`. For production, set via environment variable `VITE_API_BASE`.

## Deployment

- **Backend**: Push to GitHub, deploy on Railway with `MONGODB_URI` env var
- **Frontend**: Push to GitHub, deploy on Vercel or Netlify (auto-detects Vite)

## Git Commit Rules

- Do NOT include "Co-Authored-By: Claude" in commit messages
- Do NOT include "Generated with Claude Code" or similar attribution in PRs or commits
- Keep commit messages and PR descriptions focused on the changes only
