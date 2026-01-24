---
phase: 02-backend-api
plan: 01
type: execute
wave: 1
depends_on: ["01-data-setup"]
files_modified:
  - backend/main.py
  - backend/database.py
  - backend/models.py
  - backend/routes/stores.py
  - backend/routes/categories.py
  - backend/routes/basket.py
  - backend/requirements.txt
  - backend/.env.example
autonomous: true

must_haves:
  truths:
    - "GET /api/stores returns all 5 stores from MongoDB"
    - "GET /api/categories returns all 15 categories with calculated cheapest price"
    - "GET /api/categories/search?q=eggs returns matching categories"
    - "GET /api/categories/{id} returns full price breakdown ranked by price"
    - "POST /api/basket/analyze returns single-store best, multi-store optimal, and savings"
  artifacts:
    - path: "backend/main.py"
      provides: "FastAPI application entry point with CORS"
      min_lines: 20
    - path: "backend/database.py"
      provides: "Motor async MongoDB connection"
      exports: ["get_database", "stores_collection", "categories_collection"]
    - path: "backend/models.py"
      provides: "Pydantic models for request/response validation"
      contains: "class Store"
    - path: "backend/routes/stores.py"
      provides: "Store listing endpoint"
      exports: ["router"]
    - path: "backend/routes/categories.py"
      provides: "Category endpoints including search"
      exports: ["router"]
    - path: "backend/routes/basket.py"
      provides: "Basket analysis endpoint"
      exports: ["router"]
  key_links:
    - from: "backend/main.py"
      to: "backend/routes/*.py"
      via: "APIRouter include"
      pattern: "app\\.include_router"
    - from: "backend/routes/*.py"
      to: "backend/database.py"
      via: "MongoDB queries"
      pattern: "await.*collection\\.(find|find_one)"
---

<objective>
Build FastAPI backend with all 5 API endpoints returning real data from MongoDB.

Purpose: Provide the data layer for the frontend to display grocery prices and calculate savings.
Output: Working API server at localhost:8000 with /api/stores, /api/categories, /api/categories/search, /api/categories/{id}, and /api/basket/analyze endpoints.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md

Phase 1 must be complete (MongoDB Atlas with stores and categories collections populated).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Project Setup and Database Connection</name>
  <files>
    backend/requirements.txt
    backend/.env.example
    backend/database.py
    backend/models.py
  </files>
  <action>
    1. Create backend/ directory structure:
       ```
       backend/
         main.py
         database.py
         models.py
         routes/
           __init__.py
           stores.py
           categories.py
           basket.py
         requirements.txt
         .env.example
       ```

    2. Create requirements.txt:
       ```
       fastapi==0.109.0
       uvicorn[standard]==0.27.0
       motor==3.3.2
       pydantic==2.5.3
       pydantic-settings==2.1.0
       python-dotenv==1.0.0
       ```

    3. Create .env.example:
       ```
       MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inflationfighter?retryWrites=true&w=majority
       ```

    4. Create database.py with Motor async connection:
       ```python
       from motor.motor_asyncio import AsyncIOMotorClient
       from pydantic_settings import BaseSettings

       class Settings(BaseSettings):
           mongodb_uri: str
           class Config:
               env_file = ".env"

       settings = Settings()
       client = AsyncIOMotorClient(settings.mongodb_uri)
       db = client.inflationfighter

       stores_collection = db.stores
       categories_collection = db.categories

       async def get_database():
           return db
       ```

    5. Create models.py with Pydantic models:
       - Store: store_id, name, color
       - StoresResponse: stores list
       - PriceEntry: store_id, store_name, price
       - CategorySummary: category_id, name, icon, cheapest_store, cheapest_price, most_expensive_price, savings_percent
       - CategoriesResponse: categories list
       - CategoryDetail: category_id, name, icon, unit, prices (list of PriceEntry, sorted by price)
       - BasketItem: category_id, quantity
       - BasketRequest: items list
       - StoreTotal: store_id, store_name, total, items_available
       - MultiStoreItem: category_id, name, store_id, store_name, price, quantity
       - BasketAnalysis: single_store_best, single_store_worst, multi_store_optimal (list of MultiStoreItem), multi_store_total, savings_vs_worst, savings_percent, annual_projection
  </action>
  <verify>
    ```bash
    cd backend && python -c "from database import stores_collection, categories_collection; print('DB connection imports OK')"
    cd backend && python -c "from models import Store, CategorySummary, BasketAnalysis; print('Models import OK')"
    ```
  </verify>
  <done>
    - requirements.txt exists with all dependencies
    - database.py connects to MongoDB via Motor
    - models.py has all Pydantic models for API responses
    - .env.example documents required environment variables
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement Store and Category Endpoints</name>
  <files>
    backend/routes/__init__.py
    backend/routes/stores.py
    backend/routes/categories.py
    backend/main.py
  </files>
  <action>
    1. Create routes/__init__.py (empty, makes it a package)

    2. Create routes/stores.py:
       ```python
       from fastapi import APIRouter
       from database import stores_collection
       from models import StoresResponse, Store

       router = APIRouter(prefix="/api/stores", tags=["stores"])

       @router.get("", response_model=StoresResponse)
       async def get_stores():
           stores = await stores_collection.find({}).to_list(100)
           return {"stores": [Store(**s) for s in stores]}
       ```

    3. Create routes/categories.py:
       ```python
       from fastapi import APIRouter, HTTPException, Query
       from database import categories_collection, stores_collection
       from models import CategoriesResponse, CategorySummary, CategoryDetail, PriceEntry

       router = APIRouter(prefix="/api/categories", tags=["categories"])

       @router.get("", response_model=CategoriesResponse)
       async def get_categories():
           """List all categories with cheapest price info calculated."""
           categories = await categories_collection.find({}).to_list(100)
           stores = {s["store_id"]: s["name"] for s in await stores_collection.find({}).to_list(100)}

           result = []
           for cat in categories:
               prices = cat.get("prices", {})
               if not prices:
                   continue

               # Find cheapest and most expensive
               sorted_prices = sorted(prices.items(), key=lambda x: x[1])
               cheapest_store_id, cheapest_price = sorted_prices[0]
               _, most_expensive_price = sorted_prices[-1]

               savings_percent = round((1 - cheapest_price / most_expensive_price) * 100) if most_expensive_price > 0 else 0

               result.append(CategorySummary(
                   category_id=cat["category_id"],
                   name=cat["name"],
                   icon=cat.get("icon", ""),
                   cheapest_store=cheapest_store_id,
                   cheapest_price=cheapest_price,
                   most_expensive_price=most_expensive_price,
                   savings_percent=savings_percent
               ))

           return {"categories": result}

       @router.get("/search", response_model=CategoriesResponse)
       async def search_categories(q: str = Query(..., min_length=1)):
           """Search categories by name (case-insensitive partial match)."""
           # Use regex for case-insensitive search
           categories = await categories_collection.find({
               "$or": [
                   {"name": {"$regex": q, "$options": "i"}},
                   {"search_terms": {"$regex": q, "$options": "i"}}
               ]
           }).to_list(100)

           stores = {s["store_id"]: s["name"] for s in await stores_collection.find({}).to_list(100)}

           result = []
           for cat in categories:
               prices = cat.get("prices", {})
               if not prices:
                   continue

               sorted_prices = sorted(prices.items(), key=lambda x: x[1])
               cheapest_store_id, cheapest_price = sorted_prices[0]
               _, most_expensive_price = sorted_prices[-1]
               savings_percent = round((1 - cheapest_price / most_expensive_price) * 100) if most_expensive_price > 0 else 0

               result.append(CategorySummary(
                   category_id=cat["category_id"],
                   name=cat["name"],
                   icon=cat.get("icon", ""),
                   cheapest_store=cheapest_store_id,
                   cheapest_price=cheapest_price,
                   most_expensive_price=most_expensive_price,
                   savings_percent=savings_percent
               ))

           return {"categories": result}

       @router.get("/{category_id}", response_model=CategoryDetail)
       async def get_category(category_id: str):
           """Get full price breakdown for a category, ranked by price."""
           category = await categories_collection.find_one({"category_id": category_id})
           if not category:
               raise HTTPException(status_code=404, detail="Category not found")

           stores = {s["store_id"]: s["name"] for s in await stores_collection.find({}).to_list(100)}

           prices = category.get("prices", {})
           price_entries = [
               PriceEntry(store_id=store_id, store_name=stores.get(store_id, store_id), price=price)
               for store_id, price in prices.items()
           ]
           # Sort by price ascending
           price_entries.sort(key=lambda x: x.price)

           return CategoryDetail(
               category_id=category["category_id"],
               name=category["name"],
               icon=category.get("icon", ""),
               unit=category.get("unit", "each"),
               prices=price_entries
           )
       ```

    4. Create main.py:
       ```python
       from fastapi import FastAPI
       from fastapi.middleware.cors import CORSMiddleware
       from routes import stores, categories

       app = FastAPI(
           title="InflationFighter API",
           description="Grocery price comparison API for Canadian shoppers",
           version="1.0.0"
       )

       # CORS for frontend
       app.add_middleware(
           CORSMiddleware,
           allow_origins=["*"],  # In production, restrict to frontend domain
           allow_credentials=True,
           allow_methods=["*"],
           allow_headers=["*"],
       )

       # Include routers
       app.include_router(stores.router)
       app.include_router(categories.router)

       @app.get("/")
       async def root():
           return {"message": "InflationFighter API", "docs": "/docs"}

       @app.get("/health")
       async def health():
           return {"status": "healthy"}
       ```
  </action>
  <verify>
    ```bash
    # Start server (in background or separate terminal)
    cd backend && uvicorn main:app --reload &
    sleep 3

    # Test endpoints
    curl http://localhost:8000/api/stores
    curl http://localhost:8000/api/categories
    curl "http://localhost:8000/api/categories/search?q=eggs"
    curl http://localhost:8000/api/categories/eggs_dozen_large

    # Kill server
    pkill -f "uvicorn main:app"
    ```
  </verify>
  <done>
    - GET /api/stores returns all 5 stores from MongoDB
    - GET /api/categories returns all 15 categories with calculated cheapest_price, savings_percent
    - GET /api/categories/search?q=eggs returns matching categories
    - GET /api/categories/{id} returns price breakdown sorted by price ascending
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement Basket Analysis Endpoint</name>
  <files>
    backend/routes/basket.py
    backend/main.py (update to include basket router)
  </files>
  <action>
    1. Create routes/basket.py with the optimization logic:
       ```python
       from fastapi import APIRouter, HTTPException
       from database import categories_collection, stores_collection
       from models import (
           BasketRequest, BasketAnalysis, StoreTotal, MultiStoreItem
       )

       router = APIRouter(prefix="/api/basket", tags=["basket"])

       @router.post("/analyze", response_model=BasketAnalysis)
       async def analyze_basket(request: BasketRequest):
           """
           Analyze basket for optimal shopping strategy.
           Returns:
           - single_store_best: cheapest total if shopping at one store
           - single_store_worst: most expensive total at one store
           - multi_store_optimal: cheapest item from each store (ignoring travel)
           - savings calculations
           """
           if not request.items:
               raise HTTPException(status_code=400, detail="Basket is empty")

           # Load all stores
           stores_list = await stores_collection.find({}).to_list(100)
           stores = {s["store_id"]: s for s in stores_list}

           # Load categories for basket items
           category_ids = [item.category_id for item in request.items]
           categories = await categories_collection.find({
               "category_id": {"$in": category_ids}
           }).to_list(100)
           categories_map = {c["category_id"]: c for c in categories}

           # Calculate totals per store (single-store strategy)
           store_totals = {}
           for store_id in stores:
               total = 0
               items_available = 0
               for item in request.items:
                   cat = categories_map.get(item.category_id)
                   if cat and store_id in cat.get("prices", {}):
                       total += cat["prices"][store_id] * item.quantity
                       items_available += 1
               store_totals[store_id] = StoreTotal(
                   store_id=store_id,
                   store_name=stores[store_id]["name"],
                   total=round(total, 2),
                   items_available=items_available
               )

           # Find best and worst single-store options (only stores with all items)
           full_basket_stores = [
               st for st in store_totals.values()
               if st.items_available == len(request.items)
           ]

           if not full_basket_stores:
               # Fallback: use stores with most items
               max_items = max(st.items_available for st in store_totals.values())
               full_basket_stores = [
                   st for st in store_totals.values()
                   if st.items_available == max_items
               ]

           single_store_best = min(full_basket_stores, key=lambda x: x.total)
           single_store_worst = max(full_basket_stores, key=lambda x: x.total)

           # Calculate multi-store optimal (cheapest price per item)
           multi_store_items = []
           multi_store_total = 0

           for item in request.items:
               cat = categories_map.get(item.category_id)
               if not cat:
                   continue

               prices = cat.get("prices", {})
               if not prices:
                   continue

               # Find cheapest store for this item
               cheapest_store_id = min(prices, key=lambda x: prices[x])
               cheapest_price = prices[cheapest_store_id]

               multi_store_items.append(MultiStoreItem(
                   category_id=item.category_id,
                   name=cat["name"],
                   store_id=cheapest_store_id,
                   store_name=stores[cheapest_store_id]["name"],
                   price=cheapest_price,
                   quantity=item.quantity
               ))
               multi_store_total += cheapest_price * item.quantity

           multi_store_total = round(multi_store_total, 2)

           # Calculate savings
           savings_vs_worst = round(single_store_worst.total - multi_store_total, 2)
           savings_percent = round((savings_vs_worst / single_store_worst.total) * 100) if single_store_worst.total > 0 else 0

           # Annual projection (assuming weekly shopping)
           annual_projection = round(savings_vs_worst * 52, 2)

           return BasketAnalysis(
               single_store_best=single_store_best,
               single_store_worst=single_store_worst,
               multi_store_optimal=multi_store_items,
               multi_store_total=multi_store_total,
               savings_vs_worst=savings_vs_worst,
               savings_percent=savings_percent,
               annual_projection=annual_projection
           )
       ```

    2. Update main.py to include basket router:
       ```python
       from routes import stores, categories, basket

       # ... existing code ...

       app.include_router(basket.router)
       ```
  </action>
  <verify>
    ```bash
    cd backend && uvicorn main:app --reload &
    sleep 3

    # Test basket analysis
    curl -X POST http://localhost:8000/api/basket/analyze \
      -H "Content-Type: application/json" \
      -d '{"items": [{"category_id": "eggs_dozen_large", "quantity": 1}, {"category_id": "milk_2l", "quantity": 2}]}'

    # Verify response has all required fields
    # Should return: single_store_best, single_store_worst, multi_store_optimal, savings_vs_worst, savings_percent, annual_projection

    pkill -f "uvicorn main:app"
    ```
  </verify>
  <done>
    - POST /api/basket/analyze accepts basket items and returns optimization analysis
    - Response includes single_store_best (cheapest single store)
    - Response includes single_store_worst (most expensive single store)
    - Response includes multi_store_optimal (list of cheapest item per store)
    - Response includes savings_vs_worst, savings_percent, annual_projection
  </done>
</task>

</tasks>

<verification>
All API endpoints return real data from MongoDB:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Then edit with real MongoDB URI

# Start server
uvicorn main:app --reload

# In another terminal, test all endpoints:

# 1. Stores endpoint
curl http://localhost:8000/api/stores | jq
# Expected: {"stores": [{"store_id": "nofrills", "name": "No Frills", "color": "#FFD700"}, ...]}

# 2. Categories list
curl http://localhost:8000/api/categories | jq
# Expected: 15 categories with cheapest_price, savings_percent calculated

# 3. Search
curl "http://localhost:8000/api/categories/search?q=eggs" | jq
# Expected: categories matching "eggs"

# 4. Category detail
curl http://localhost:8000/api/categories/eggs_dozen_large | jq
# Expected: prices array sorted by price ascending

# 5. Basket analysis
curl -X POST http://localhost:8000/api/basket/analyze \
  -H "Content-Type: application/json" \
  -d '{"items": [{"category_id": "eggs_dozen_large", "quantity": 2}, {"category_id": "bread_white", "quantity": 1}]}' | jq
# Expected: single_store_best, single_store_worst, multi_store_optimal, savings data

# Check API docs
open http://localhost:8000/docs
```
</verification>

<success_criteria>
1. GET /api/stores returns all 5 stores with store_id, name, color
2. GET /api/categories returns all 15 categories with calculated cheapest_price and savings_percent
3. GET /api/categories/search?q=eggs returns matching categories (case-insensitive)
4. GET /api/categories/{id} returns full price breakdown with prices sorted by price ascending
5. POST /api/basket/analyze returns complete analysis with single_store_best, single_store_worst, multi_store_optimal, and savings calculations
6. All endpoints return data from MongoDB (not hardcoded in API)
7. CORS enabled for frontend integration
8. API docs available at /docs
</success_criteria>

<output>
After completion, create `.planning/phases/02-backend-api/02-01-SUMMARY.md` with:
- Files created
- Endpoints implemented
- Any deviations or decisions made
- Verification results
</output>
