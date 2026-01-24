from pydantic import BaseModel
from typing import Optional


class Store(BaseModel):
    store_id: str
    name: str
    color: str


class DealInfo(BaseModel):
    sale_price: float
    regular_price: float
    ends: str  # Date string like "2025-01-31"


class StoresResponse(BaseModel):
    stores: list[Store]


class CategorySummary(BaseModel):
    category_id: str
    name: str
    icon: str
    unit: str
    image_url: Optional[str] = None
    cheapest_store: str
    cheapest_price: float
    most_expensive_price: float
    savings_percent: int
    previous_price: Optional[float] = None


class CategoriesResponse(BaseModel):
    categories: list[CategorySummary]


class PriceEntry(BaseModel):
    store_id: str
    store_name: str
    price: float
    color: str
    deal: Optional[DealInfo] = None


class CategoryDetail(BaseModel):
    category_id: str
    name: str
    icon: str
    unit: str
    image_url: Optional[str] = None
    unit_qty: Optional[float] = None
    standard_unit: Optional[str] = None
    previous_price: Optional[float] = None
    prices: list[PriceEntry]


class BasketItem(BaseModel):
    category_id: str
    quantity: int


class BasketRequest(BaseModel):
    items: list[BasketItem]


class StoreTotal(BaseModel):
    store_id: str
    store_name: str
    total: float
    color: str


class MultiStoreItem(BaseModel):
    category_id: str
    name: str
    store_id: str
    store_name: str
    price: float
    quantity: int
    color: str


class BasketAnalysis(BaseModel):
    single_store_best: StoreTotal
    single_store_worst: StoreTotal
    multi_store_optimal: list[MultiStoreItem]
    multi_store_total: float
    savings_vs_worst: float
    savings_percent: int
    annual_projection: float


class RecipeGenerateRequest(BaseModel):
    ingredients: list[str] = []
    dietary: list[str] = []
    exclude: list[str] = []
    cuisine: Optional[str] = None
    meal_type: Optional[str] = None
    servings: int = 2
    time_minutes: Optional[int] = None
    budget_cad: Optional[float] = None
    use_deals: bool = True
    max_items: int = 12


class RetrievedItem(BaseModel):
    category_id: str
    name: str
    unit: str
    cheapest_store: str
    cheapest_price: float
    deal: Optional[DealInfo] = None


class RecipeGenerateResponse(BaseModel):
    recipe_text: str
    rag_items: list[RetrievedItem]
