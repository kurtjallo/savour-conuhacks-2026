# CLAUDE.md - InflationFighter Codebase Guide

## Project Overview

InflationFighter is a grocery price comparison app for Canadian shoppers. Users browse 15 common grocery items, compare prices across 5 major stores, build a basket, and see optimized shopping strategies with savings calculations.

**Core value:** Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python FastAPI |
| Database | MongoDB Atlas |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Deployment | Railway (backend) + Vercel (frontend) |

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
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Home page (hero + category grid)
│   │   │   ├── layout.tsx           # Root layout with BasketProvider
│   │   │   ├── basket/page.tsx      # Basket with savings analysis
│   │   │   └── category/[id]/page.tsx  # Price comparison table
│   │   ├── components/
│   │   │   ├── Header.tsx           # Nav with basket count
│   │   │   ├── SearchBar.tsx        # Search input
│   │   │   ├── CategoryCard.tsx     # Product card
│   │   │   └── AddToBasket.tsx      # Quantity selector
│   │   ├── context/
│   │   │   └── BasketContext.tsx    # Basket state + localStorage
│   │   └── lib/
│   │       ├── api.ts               # API client functions
│   │       └── types.ts             # TypeScript interfaces
│   └── .env.local                   # NEXT_PUBLIC_API_URL
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
npm run dev  # Runs on :3000
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

### Categories (15 products)
- eggs, milk, bread, butter, apples, bananas, potatoes, onions, chicken, ground-beef, pasta, rice, cheese, canned-tomatoes, cereal
- Fields: `category_id`, `name`, `icon`, `unit`, `search_terms`, `prices` (object with store_id → price)

## Key Patterns

1. **Basket persistence**: Uses localStorage via BasketContext
2. **API base URL**: Set via `NEXT_PUBLIC_API_URL` environment variable
3. **Price calculations**: Cheapest/most expensive computed on the fly from prices object
4. **Icons**: Mapped from icon string to emoji in CategoryCard and category page

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

- **Backend**: Push to GitHub, deploy on Railway with `MONGODB_URI` env var
- **Frontend**: Deploy on Vercel with `NEXT_PUBLIC_API_URL` pointing to Railway URL
