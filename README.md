# InflationFighter

A grocery price comparison mobile app for Canadian shoppers. Compare prices across 5 major stores, build a basket, and see optimized shopping strategies with real savings calculations.

## Features

- **Price Comparison** - Compare 25 common grocery items across 5 Canadian stores
- **Best Deals** - See which items have the biggest price differences
- **Smart Basket** - Build a shopping list and get optimization suggestions
- **Multi-Store Optimization** - Find out if shopping at multiple stores saves money
- **Savings Calculator** - See exactly how much you could save annually
- **Favorites** - Quick access to items you buy regularly
- **Weekly Deals** - Track store sales and promotions

## Stores Covered

- No Frills
- FreshCo
- Walmart
- Loblaws
- Metro

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python FastAPI |
| Database | MongoDB Atlas |
| Mobile | React Native / Expo + TypeScript |
| Icons | Ionicons |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free tier works)
- Expo Go app (for mobile testing)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" > .env

# Seed the database
python3 scripts/seed_db.py

# Start the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go (requires ngrok for physical device)

### Physical Device Testing

Physical devices can't reach `localhost`. You need to tunnel the backend:

```bash
# Install ngrok
brew install ngrok

# Tunnel the backend
ngrok http 8000

# Create mobile/.env with the ngrok URL
echo "EXPO_PUBLIC_API_URL=https://your-subdomain.ngrok-free.app" > mobile/.env

# Restart Expo
npx expo start --clear
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all 5 stores |
| GET | `/api/categories` | List all products with prices |
| GET | `/api/categories/search?q=` | Search products |
| GET | `/api/categories/{id}` | Get price breakdown for one product |
| POST | `/api/basket/analyze` | Analyze basket for optimization |

## Project Structure

```
groceryPriec/
├── backend/
│   ├── main.py              # FastAPI endpoints
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   └── scripts/
│       └── seed_db.py       # Database seeding
├── mobile/
│   ├── App.tsx              # Main app with navigation
│   └── src/
│       ├── screens/         # Home, Category, Basket, Deals
│       ├── components/      # CategoryCard, SearchBar, etc.
│       ├── context/         # Basket & Favorites state
│       ├── lib/             # API, types, theme, icons
│       └── navigation/      # Type definitions
└── README.md
```

## Screenshots

The app features:
- Clean light theme with green accents
- Bottom tab navigation (Home, Deals, Basket)
- Product cards with price ranges and savings badges
- Detailed price comparison tables
- Basket optimization with multi-store suggestions

## Demo Hook

> "Canadians overpay $1200/year on groceries — we fix that"

## Built For

ConUHacks 2025

## License

MIT
