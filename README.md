# Savour

A grocery price comparison web app for Canadian shoppers. Compare prices across 5 major stores, build a basket, and see optimized shopping strategies with real savings calculations.

## Features

- **Price Comparison** - Compare grocery items across 5 Canadian stores
- **Price History Charts** - Track price trends over time with visual charts
- **Smart Basket** - Build a shopping list and get optimization suggestions
- **Multi-Store Optimization** - Find out if shopping at multiple stores saves money
- **Savings Calculator** - See exactly how much you could save annually
- **AI Recipe Generator** - Generate recipes based on your basket items

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
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free tier works)

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

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all 5 stores |
| GET | `/api/categories` | List all products with prices |
| GET | `/api/categories/search?q=` | Search products |
| GET | `/api/categories/{id}` | Get price breakdown for one product |
| POST | `/api/basket/analyze` | Analyze basket for optimization |
| POST | `/api/recipe/generate` | Generate recipe from ingredients |

## Project Structure

```
savour-conuhacks-2026/
├── backend/
│   ├── main.py              # FastAPI endpoints
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   └── scripts/
│       └── seed_db.py       # Database seeding
├── frontend/
│   ├── index.html           # Vite entry point
│   ├── vite.config.ts       # Vite configuration
│   └── src/
│       ├── App.tsx          # Main app with routing
│       ├── screens/         # Landing, Home, Products, Category, Basket
│       ├── components/      # UI components
│       ├── context/         # Basket state management
│       └── lib/             # API, types, theme
└── README.md
```

## Built For

ConUHacks 2026

## License

MIT
