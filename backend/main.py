import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import stores_collection, categories_collection
from models import (
    Store, StoresResponse, CategorySummary, CategoriesResponse,
    PriceEntry, CategoryDetail, BasketRequest, BasketAnalysis,
    StoreTotal, MultiStoreItem, DealInfo
)

app = FastAPI(
    title="InflationFighter API",
    description="Grocery price comparison API for Canadian shoppers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "InflationFighter API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/stores", response_model=StoresResponse)
async def get_stores():
    stores = await stores_collection.find({}).to_list(100)
    return {"stores": [Store(**s) for s in stores]}


@app.get("/api/categories", response_model=CategoriesResponse)
async def get_categories():
    categories = await categories_collection.find({}).to_list(100)
    stores = {s["store_id"]: s for s in await stores_collection.find({}).to_list(100)}

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
            unit=cat.get("unit", ""),
            image_url=cat.get("image_url"),
            cheapest_store=cheapest_store_id,
            cheapest_price=cheapest_price,
            most_expensive_price=most_expensive_price,
            savings_percent=savings_percent
        ))

    return {"categories": result}


@app.get("/api/categories/search", response_model=CategoriesResponse)
async def search_categories(q: str = Query(..., min_length=1)):
    categories = await categories_collection.find({
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"search_terms": {"$regex": q, "$options": "i"}}
        ]
    }).to_list(100)

    stores = {s["store_id"]: s for s in await stores_collection.find({}).to_list(100)}

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
            unit=cat.get("unit", ""),
            image_url=cat.get("image_url"),
            cheapest_store=cheapest_store_id,
            cheapest_price=cheapest_price,
            most_expensive_price=most_expensive_price,
            savings_percent=savings_percent
        ))

    return {"categories": result}


@app.get("/api/categories/{category_id}", response_model=CategoryDetail)
async def get_category(category_id: str):
    category = await categories_collection.find_one({"category_id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    stores = {s["store_id"]: s for s in await stores_collection.find({}).to_list(100)}

    prices = category.get("prices", {})
    deals = category.get("deals", {})

    price_entries = []
    for store_id, price in prices.items():
        deal_data = deals.get(store_id)
        deal = DealInfo(**deal_data) if deal_data else None

        # Use sale price for sorting if there's an active deal
        effective_price = deal.sale_price if deal else price

        price_entries.append(PriceEntry(
            store_id=store_id,
            store_name=stores.get(store_id, {}).get("name", store_id),
            price=effective_price,
            color=stores.get(store_id, {}).get("color", "#000000"),
            deal=deal
        ))

    price_entries.sort(key=lambda x: x.price)

    return CategoryDetail(
        category_id=category["category_id"],
        name=category["name"],
        icon=category.get("icon", ""),
        unit=category.get("unit", ""),
        image_url=category.get("image_url"),
        unit_qty=category.get("unit_qty"),
        standard_unit=category.get("standard_unit"),
        prices=price_entries
    )


@app.post("/api/basket/analyze", response_model=BasketAnalysis)
async def analyze_basket(request: BasketRequest):
    if not request.items:
        raise HTTPException(status_code=400, detail="Basket is empty")

    stores_list = await stores_collection.find({}).to_list(100)
    stores = {s["store_id"]: s for s in stores_list}

    category_ids = [item.category_id for item in request.items]
    categories = await categories_collection.find({"category_id": {"$in": category_ids}}).to_list(100)
    categories_map = {c["category_id"]: c for c in categories}

    # Calculate totals per store
    store_totals = {}
    for store_id, store in stores.items():
        total = 0
        for item in request.items:
            cat = categories_map.get(item.category_id)
            if cat and store_id in cat.get("prices", {}):
                total += cat["prices"][store_id] * item.quantity
        store_totals[store_id] = StoreTotal(
            store_id=store_id,
            store_name=store["name"],
            total=round(total, 2),
            color=store["color"]
        )

    sorted_stores = sorted(store_totals.values(), key=lambda x: x.total)
    single_store_best = sorted_stores[0]
    single_store_worst = sorted_stores[-1]

    # Multi-store optimal
    multi_store_items = []
    multi_store_total = 0

    for item in request.items:
        cat = categories_map.get(item.category_id)
        if not cat:
            continue

        prices = cat.get("prices", {})
        if not prices:
            continue

        cheapest_store_id = min(prices, key=lambda x: prices[x])
        cheapest_price = prices[cheapest_store_id]

        multi_store_items.append(MultiStoreItem(
            category_id=item.category_id,
            name=cat["name"],
            store_id=cheapest_store_id,
            store_name=stores[cheapest_store_id]["name"],
            price=cheapest_price,
            quantity=item.quantity,
            color=stores[cheapest_store_id]["color"]
        ))
        multi_store_total += cheapest_price * item.quantity

    multi_store_total = round(multi_store_total, 2)
    savings_vs_worst = round(single_store_worst.total - multi_store_total, 2)
    savings_percent = round((savings_vs_worst / single_store_worst.total) * 100) if single_store_worst.total > 0 else 0
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
