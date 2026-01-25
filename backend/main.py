import os
import time
import logging
from typing import Any
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from database import stores_collection, categories_collection
from models import (
    Store, StoresResponse, CategorySummary, CategoriesResponse,
    PriceEntry, CategoryDetail, BasketRequest, BasketAnalysis,
    StoreTotal, MultiStoreItem, DealInfo,
    RecipeGenerateRequest, RecipeGenerateResponse, RetrievedItem,
    RouteOptimizeRequest, RouteOptimizeResponse, StoreWithLocation,
    StoreVisit, TravelCost, Location
)

app = FastAPI(
    title="InflationFighter API",
    description="Grocery price comparison API for Canadian shoppers",
    version="1.0.0"
)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("savour")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

OPENROUTE_API_KEY = os.getenv("OPENROUTE_API_KEY", "")
OPENROUTE_URL = "https://api.openrouteservice.org/v2/directions/driving-car"


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
    categories = await categories_collection.find({}).sort("sort_order", 1).to_list(1500)
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
            savings_percent=savings_percent,
            previous_price=cat.get("previous_price")
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
            savings_percent=savings_percent,
            previous_price=cat.get("previous_price")
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
        previous_price=category.get("previous_price"),
        description=category.get("description"),
        availability=category.get("availability"),
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


def _normalize_terms(values: list[str]) -> list[str]:
    seen = set()
    cleaned = []
    for value in values:
        for term in value.split(","):
            term = term.strip().lower()
            if term and term not in seen:
                cleaned.append(term)
                seen.add(term)
    return cleaned


async def _retrieve_rag_items(request: RecipeGenerateRequest) -> list[RetrievedItem]:
    t0 = time.perf_counter()
    query = {}
    if request.category_ids:
        query = {"category_id": {"$in": request.category_ids}}
    else:
        terms = _normalize_terms(request.ingredients)
        if request.cuisine:
            terms.extend(_normalize_terms([request.cuisine]))
        if request.meal_type:
            terms.extend(_normalize_terms([request.meal_type]))

        if terms:
            or_filters = []
            for term in terms:
                or_filters.append({"name": {"$regex": term, "$options": "i"}})
                or_filters.append({"search_terms": {"$regex": term, "$options": "i"}})
            query = {"$or": or_filters}

    logger.info("recipe.rag.query built %s", query or {})
    categories = await categories_collection.find(query).to_list(200)
    stores = {s["store_id"]: s for s in await stores_collection.find({}).to_list(100)}

    retrieved = []
    for cat in categories:
        prices = cat.get("prices", {})
        if not prices:
            continue

        cheapest_store_id = min(prices, key=lambda x: prices[x])
        cheapest_price = prices[cheapest_store_id]
        deal_data = cat.get("deals", {}).get(cheapest_store_id)
        deal = DealInfo(**deal_data) if deal_data else None

        retrieved.append(RetrievedItem(
            category_id=cat["category_id"],
            name=cat["name"],
            unit=cat.get("unit", ""),
            cheapest_store=stores.get(cheapest_store_id, {}).get("name", cheapest_store_id),
            cheapest_price=cheapest_price,
            deal=deal
        ))

    retrieved.sort(key=lambda item: item.cheapest_price)
    if not retrieved:
        logger.warning("recipe.rag.empty_results duration_ms=%s", round((time.perf_counter() - t0) * 1000, 1))
        return []

    trimmed = retrieved[: max(1, request.max_items)]
    logger.info(
        "recipe.rag.results count=%s trimmed=%s duration_ms=%s",
        len(retrieved),
        len(trimmed),
        round((time.perf_counter() - t0) * 1000, 1),
    )
    return trimmed


def _build_rag_context(items: list[RetrievedItem], request: RecipeGenerateRequest) -> str:
    if not items:
        return "No matching grocery items found in the database."

    lines = []
    for item in items:
        deal_line = ""
        if request.use_deals and item.deal:
            deal_line = f" Deal: ${item.deal.sale_price:.2f} (reg ${item.deal.regular_price:.2f}) until {item.deal.ends}."
        lines.append(
            f"- {item.name} ({item.unit}) at {item.cheapest_store}: ${item.cheapest_price:.2f}.{deal_line}"
        )
    return "\n".join(lines)


def _build_recipe_prompt(request: RecipeGenerateRequest, rag_context: str) -> str:
    constraints = [
        f"Servings: {request.servings}."
    ]
    if request.cuisine:
        constraints.append(f"Cuisine: {request.cuisine}.")
    if request.meal_type:
        constraints.append(f"Meal type: {request.meal_type}.")
    if request.time_minutes:
        constraints.append(f"Time limit: {request.time_minutes} minutes.")
    if request.budget_cad:
        constraints.append(f"Budget: ${request.budget_cad:.2f} CAD.")
    if request.dietary:
        constraints.append(f"Dietary: {', '.join(request.dietary)}.")
    if request.exclude:
        constraints.append(f"Exclude: {', '.join(request.exclude)}.")
    if request.ingredients:
        constraints.append(f"Requested ingredients: {', '.join(request.ingredients)}.")

    constraints_text = " ".join(constraints)

    return (
        "You are a recipe assistant. Use the grocery context to craft a practical recipe. "
        "Only use items listed in the context; if a pantry staple is required (salt, oil, water), "
        "add at most two and label them clearly. "
        "Return a concise recipe with a title, ingredient list, and numbered steps. "
        "Include a short note on estimated cost drivers and how the deals affect the recipe.\n\n"
        f"GROCERY CONTEXT:\n{rag_context}\n\n"
        f"CONSTRAINTS:\n{constraints_text}"
    )


async def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    t0 = time.perf_counter()
    payload: dict[str, Any] = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json=payload
            )
        except httpx.HTTPError as exc:
            logger.exception("recipe.gemini.http_error duration_ms=%s error=%s", round((time.perf_counter() - t0) * 1000, 1), exc)
            raise HTTPException(status_code=502, detail="Gemini API request failed") from exc

    if response.status_code >= 400:
        logger.error(
            "recipe.gemini.error status=%s duration_ms=%s body=%s",
            response.status_code,
            round((time.perf_counter() - t0) * 1000, 1),
            response.text[:500],
        )
        raise HTTPException(status_code=502, detail=f"Gemini API error: {response.text}")

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        logger.error("recipe.gemini.no_candidates duration_ms=%s", round((time.perf_counter() - t0) * 1000, 1))
        raise HTTPException(status_code=502, detail="Gemini API returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        logger.error("recipe.gemini.empty_content duration_ms=%s", round((time.perf_counter() - t0) * 1000, 1))
        raise HTTPException(status_code=502, detail="Gemini API returned empty content")

    text = "".join(part.get("text", "") for part in parts).strip()
    logger.info("recipe.gemini.success chars=%s duration_ms=%s", len(text), round((time.perf_counter() - t0) * 1000, 1))
    return text


@app.get("/api/recipes/status")
async def recipe_status():
    """Check if recipe generation is available (Gemini API key configured)."""
    return {"available": bool(GEMINI_API_KEY)}


@app.post("/api/recipes/generate", response_model=RecipeGenerateResponse)
async def generate_recipe(request: RecipeGenerateRequest):
    start = time.perf_counter()
    logger.info(
        "recipe.request received servings=%s max_items=%s use_deals=%s cuisine=%s meal_type=%s",
        request.servings,
        request.max_items,
        request.use_deals,
        request.cuisine or "",
        request.meal_type or "",
    )
    rag_items = await _retrieve_rag_items(request)
    rag_context = _build_rag_context(rag_items, request)
    logger.info("recipe.context built lines=%s chars=%s", rag_context.count("\n") + 1, len(rag_context))
    prompt = _build_recipe_prompt(request, rag_context)
    logger.info("recipe.prompt built chars=%s", len(prompt))
    recipe_text = await _call_gemini(prompt)
    logger.info("recipe.response ready duration_ms=%s", round((time.perf_counter() - start) * 1000, 1))

    return RecipeGenerateResponse(
        recipe_text=recipe_text,
        rag_items=rag_items
    )


# --- Route Optimization ---

async def _get_stores_with_locations() -> dict[str, StoreWithLocation]:
    """Fetch stores that have location data."""
    stores = await stores_collection.find({}).to_list(100)
    result = {}
    for s in stores:
        if "lat" in s and "lng" in s:
            result[s["store_id"]] = StoreWithLocation(
                store_id=s["store_id"],
                name=s["name"],
                color=s["color"],
                address=s.get("address", ""),
                lat=s["lat"],
                lng=s["lng"]
            )
    return result


async def _call_openroute(coordinates: list[list[float]]) -> dict:
    """
    Call OpenRouteService API for route calculation.
    coordinates: [[lng, lat], [lng, lat], ...] - NOTE: ORS uses lng,lat order!
    """
    if not OPENROUTE_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTE_API_KEY not configured")

    payload = {
        "coordinates": coordinates,
        "instructions": False,
        "geometry": True,
        "preference": "fastest"
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                OPENROUTE_URL,
                headers={
                    "Authorization": OPENROUTE_API_KEY,
                    "Content-Type": "application/json"
                },
                json=payload
            )
        except httpx.HTTPError as exc:
            logger.exception("openroute.http_error error=%s", exc)
            raise HTTPException(status_code=502, detail="OpenRouteService request failed") from exc

    if response.status_code >= 400:
        logger.error("openroute.error status=%s body=%s", response.status_code, response.text[:500])
        raise HTTPException(status_code=502, detail=f"OpenRouteService error: {response.text}")

    return response.json()


def _calculate_optimal_route_order(
    user_loc: Location,
    store_locations: dict[str, StoreWithLocation],
    stores_to_visit: set[str]
) -> list[str]:
    """
    Calculate optimal visiting order using nearest neighbor heuristic.
    For small number of stores (<=5), this is efficient enough.
    """
    if len(stores_to_visit) <= 1:
        return list(stores_to_visit)

    # Simple nearest neighbor algorithm
    remaining = set(stores_to_visit)
    order = []
    current_lat, current_lng = user_loc.lat, user_loc.lng

    while remaining:
        nearest = None
        nearest_dist = float('inf')
        for store_id in remaining:
            store = store_locations[store_id]
            # Euclidean distance (good enough for ordering)
            dist = ((store.lat - current_lat) ** 2 + (store.lng - current_lng) ** 2) ** 0.5
            if dist < nearest_dist:
                nearest_dist = dist
                nearest = store_id

        order.append(nearest)
        remaining.remove(nearest)
        store = store_locations[nearest]
        current_lat, current_lng = store.lat, store.lng

    return order


@app.get("/api/stores/locations")
async def get_store_locations():
    """Get all stores with their location data for map display."""
    stores = await stores_collection.find({}).to_list(100)
    result = []
    for s in stores:
        if "lat" in s and "lng" in s:
            result.append({
                "store_id": s["store_id"],
                "name": s["name"],
                "color": s["color"],
                "address": s.get("address", ""),
                "lat": s["lat"],
                "lng": s["lng"]
            })
    return {"stores": result}


@app.post("/api/routes/optimize", response_model=RouteOptimizeResponse)
async def optimize_route(request: RouteOptimizeRequest):
    """
    Optimize shopping route and calculate if multi-store shopping is worth it.
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="Basket is empty")

    # Get stores with locations
    stores_with_loc = await _get_stores_with_locations()
    if not stores_with_loc:
        raise HTTPException(status_code=500, detail="No stores with location data found")

    # Get all stores for price lookups (even ones without locations)
    all_stores = {s["store_id"]: s for s in await stores_collection.find({}).to_list(100)}

    # Get category data for basket items
    category_ids = [item.category_id for item in request.items]
    categories = await categories_collection.find({"category_id": {"$in": category_ids}}).to_list(100)
    categories_map = {c["category_id"]: c for c in categories}

    # Calculate single-store totals
    store_totals = {}
    for store_id in stores_with_loc:
        total = 0
        for item in request.items:
            cat = categories_map.get(item.category_id)
            if cat and store_id in cat.get("prices", {}):
                total += cat["prices"][store_id] * item.quantity
        store_totals[store_id] = total

    sorted_stores = sorted(store_totals.items(), key=lambda x: x[1])
    single_store_best_id, single_store_best_total = sorted_stores[0]
    single_store_best_name = stores_with_loc[single_store_best_id].name

    # Calculate multi-store optimal (cheapest per item)
    multi_store_items = []
    stores_needed = set()
    multi_store_total = 0

    for item in request.items:
        cat = categories_map.get(item.category_id)
        if not cat:
            continue
        prices = cat.get("prices", {})
        if not prices:
            continue

        # Only consider stores with locations for route optimization
        available_prices = {sid: p for sid, p in prices.items() if sid in stores_with_loc}
        if not available_prices:
            continue

        cheapest_store_id = min(available_prices, key=lambda x: available_prices[x])
        cheapest_price = available_prices[cheapest_store_id]
        stores_needed.add(cheapest_store_id)

        store = stores_with_loc[cheapest_store_id]
        multi_store_items.append(MultiStoreItem(
            category_id=item.category_id,
            name=cat["name"],
            store_id=cheapest_store_id,
            store_name=store.name,
            price=cheapest_price,
            quantity=item.quantity,
            color=store.color
        ))
        multi_store_total += cheapest_price * item.quantity

    multi_store_total = round(multi_store_total, 2)
    grocery_savings = round(single_store_best_total - multi_store_total, 2)

    # If only one store needed, no route optimization needed
    if len(stores_needed) == 1:
        store_id = list(stores_needed)[0]
        store = stores_with_loc[store_id]
        items_for_store = [i for i in multi_store_items if i.store_id == store_id]

        return RouteOptimizeResponse(
            stores_to_visit=[StoreVisit(
                store=store,
                items_to_buy=items_for_store,
                store_subtotal=multi_store_total,
                visit_duration_minutes=request.settings.time_per_store_minutes
            )],
            route_polyline=None,
            travel_cost=TravelCost(
                total_distance_km=0,
                total_drive_time_minutes=0,
                total_store_time_minutes=request.settings.time_per_store_minutes,
                total_trip_time_minutes=request.settings.time_per_store_minutes,
                gas_cost=0,
                time_cost=0,
                total_travel_cost=0
            ),
            grocery_total=multi_store_total,
            single_store_best_total=round(single_store_best_total, 2),
            single_store_best_name=single_store_best_name,
            multi_store_total=multi_store_total,
            grocery_savings=grocery_savings,
            net_savings=grocery_savings,
            is_worth_it=True,
            recommendation=f"Shop at {store.name} - it has the best prices for all your items!"
        )

    # Calculate optimal route order
    route_order = _calculate_optimal_route_order(
        request.user_location,
        stores_with_loc,
        stores_needed
    )

    # Build coordinates for OpenRouteService (user -> stores -> user)
    coords = [[request.user_location.lng, request.user_location.lat]]  # ORS uses lng,lat
    for store_id in route_order:
        store = stores_with_loc[store_id]
        coords.append([store.lng, store.lat])
    coords.append([request.user_location.lng, request.user_location.lat])  # Return home

    # Call OpenRouteService
    route_polyline = None
    try:
        ors_response = await _call_openroute(coords)
        route_data = ors_response["routes"][0]
        summary = route_data["summary"]
        total_distance_km = round(summary["distance"] / 1000, 2)
        total_drive_time_minutes = round(summary["duration"] / 60, 1)
        route_polyline = route_data.get("geometry")
    except HTTPException:
        # Fallback: estimate using straight-line distance
        logger.warning("openroute.fallback using haversine estimation")
        total_distance_km = 0
        for i in range(len(coords) - 1):
            lat1, lng1 = coords[i][1], coords[i][0]
            lat2, lng2 = coords[i + 1][1], coords[i + 1][0]
            # Simple approximation for Toronto area (~111km per degree)
            dist = ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) ** 0.5 * 111
            total_distance_km += dist
        total_distance_km = round(total_distance_km * 1.3, 2)  # Add 30% for road curves
        total_drive_time_minutes = round(total_distance_km / 40 * 60, 1)  # Assume 40km/h avg

    # Calculate travel costs
    settings = request.settings
    gas_cost = round(
        (total_distance_km / 100) * settings.fuel_efficiency_l_per_100km * settings.gas_price_per_liter,
        2
    )
    total_store_time = len(stores_needed) * settings.time_per_store_minutes
    total_trip_time = total_drive_time_minutes + total_store_time
    time_cost = round(
        (total_trip_time / 60) * settings.time_value_per_hour,
        2
    )
    total_travel_cost = round(gas_cost + time_cost, 2)

    travel_cost = TravelCost(
        total_distance_km=total_distance_km,
        total_drive_time_minutes=total_drive_time_minutes,
        total_store_time_minutes=total_store_time,
        total_trip_time_minutes=round(total_trip_time, 1),
        gas_cost=gas_cost,
        time_cost=time_cost,
        total_travel_cost=total_travel_cost
    )

    # Build store visits
    stores_to_visit = []
    for store_id in route_order:
        store = stores_with_loc[store_id]
        items_for_store = [i for i in multi_store_items if i.store_id == store_id]
        subtotal = sum(i.price * i.quantity for i in items_for_store)
        stores_to_visit.append(StoreVisit(
            store=store,
            items_to_buy=items_for_store,
            store_subtotal=round(subtotal, 2),
            visit_duration_minutes=settings.time_per_store_minutes
        ))

    # Calculate net savings and verdict
    net_savings = round(grocery_savings - total_travel_cost, 2)
    is_worth_it = net_savings > 0

    # Generate recommendation
    if is_worth_it:
        recommendation = (
            f"Yes! Visit {len(stores_needed)} stores to save ${net_savings:.2f} "
            f"(${grocery_savings:.2f} in groceries minus ${total_travel_cost:.2f} travel cost). "
            f"Total trip: {total_distance_km:.1f}km, ~{int(total_trip_time)} minutes."
        )
    else:
        recommendation = (
            f"Not worth it. While you'd save ${grocery_savings:.2f} on groceries, "
            f"travel costs (${total_travel_cost:.2f}) exceed savings. "
            f"Just shop at {single_store_best_name} for ${single_store_best_total:.2f}."
        )

    return RouteOptimizeResponse(
        stores_to_visit=stores_to_visit,
        route_polyline=route_polyline,
        travel_cost=travel_cost,
        grocery_total=multi_store_total,
        single_store_best_total=round(single_store_best_total, 2),
        single_store_best_name=single_store_best_name,
        multi_store_total=multi_store_total,
        grocery_savings=grocery_savings,
        net_savings=net_savings,
        is_worth_it=is_worth_it,
        recommendation=recommendation
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
