# CLAUDE.md - InflationFighter Codebase Guide

## Project Overview

InflationFighter is a grocery price comparison mobile app for Canadian shoppers. Users browse 15 common grocery items, compare prices across 5 major stores, build a basket, and see optimized shopping strategies with savings calculations.

**Core value:** Show users exactly how much they can save by shopping smarter — with real numbers, not vague advice.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python FastAPI |
| Database | MongoDB Atlas |
| Mobile | React Native / Expo + TypeScript |
| Deployment | Railway (backend) + Expo/EAS (mobile) |

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
├── mobile/
│   ├── App.tsx              # Main app with navigation
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx      # Category grid + search
│   │   │   ├── CategoryScreen.tsx  # Price comparison table
│   │   │   └── BasketScreen.tsx    # Basket with optimization
│   │   ├── components/
│   │   │   ├── CategoryCard.tsx    # Product card
│   │   │   ├── SearchBar.tsx       # Search input
│   │   │   └── AddToBasket.tsx     # Quantity selector
│   │   ├── context/
│   │   │   └── BasketContext.tsx   # Basket state + AsyncStorage
│   │   ├── lib/
│   │   │   ├── api.ts              # API client functions
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   ├── icons.ts            # Emoji icon mapping
│   │   │   └── theme.ts            # Colors, spacing, fonts
│   │   └── navigation/
│   │       └── types.ts            # Navigation type definitions
│   └── package.json
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

### Mobile
```bash
cd mobile
npm install
npx expo start
# Press 'i' for iOS Simulator, 'a' for Android Emulator
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

1. **Basket persistence**: Uses AsyncStorage via BasketContext
2. **API base URL**: Configured in `mobile/src/lib/api.ts` (localhost:8000 for dev)
3. **Price calculations**: Cheapest/most expensive computed on the fly from prices object
4. **Icons**: Mapped from icon string to emoji in `mobile/src/lib/icons.ts`
5. **Navigation**: React Navigation with Stack navigator (Home → Category → Basket)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
```

### Mobile
API_BASE is configured in `mobile/src/lib/api.ts`. For physical device testing, update to your computer's IP address.

## Deployment

- **Backend**: Push to GitHub, deploy on Railway with `MONGODB_URI` env var
- **Mobile**: Use Expo EAS Build for iOS/Android builds
