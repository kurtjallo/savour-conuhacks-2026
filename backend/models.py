from pydantic import BaseModel
from typing import Optional


class Store(BaseModel):
    store_id: str
    name: str
    color: str


class StoresResponse(BaseModel):
    stores: list[Store]


class CategorySummary(BaseModel):
    category_id: str
    name: str
    icon: str
    unit: str
    cheapest_store: str
    cheapest_price: float
    most_expensive_price: float
    savings_percent: int


class CategoriesResponse(BaseModel):
    categories: list[CategorySummary]


class PriceEntry(BaseModel):
    store_id: str
    store_name: str
    price: float
    color: str


class CategoryDetail(BaseModel):
    category_id: str
    name: str
    icon: str
    unit: str
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


class BasketAnalysis(BaseModel):
    single_store_best: StoreTotal
    single_store_worst: StoreTotal
    multi_store_optimal: list[MultiStoreItem]
    multi_store_total: float
    savings_vs_worst: float
    savings_percent: int
    annual_projection: float
