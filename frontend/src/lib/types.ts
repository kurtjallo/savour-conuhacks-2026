export interface Store {
  store_id: string;
  name: string;
  color: string;
}

export interface Category {
  category_id: string;
  name: string;
  icon: string;
  unit: string;
  prices: Record<string, number>;
  cheapest_store: string;
  cheapest_price: number;
  most_expensive_store: string;
  most_expensive_price: number;
}

export interface BasketItem {
  category_id: string;
  name: string;
  quantity: number;
  icon: string;
}

export interface StoreTotal {
  store_id: string;
  store_name: string;
  total: number;
}

export interface MultiStoreItem {
  category_id: string;
  name: string;
  quantity: number;
  best_store: string;
  unit_price: number;
  subtotal: number;
}

export interface MultiStoreOptimal {
  items: MultiStoreItem[];
  total: number;
  stores_needed: string[];
}

export interface BasketAnalysis {
  single_store_best: StoreTotal;
  single_store_worst: StoreTotal;
  multi_store_optimal: MultiStoreOptimal;
  savings_vs_worst: number;
  savings_percent: number;
  annual_projection: number;
}

export interface DealInfo {
  sale_price: number;
  regular_price: number;
  ends: string;
}

export interface RetrievedItem {
  category_id: string;
  name: string;
  unit: string;
  cheapest_store: string;
  cheapest_price: number;
  deal?: DealInfo;
}

export interface RecipeGenerateResponse {
  recipe_text: string;
  rag_items: RetrievedItem[];
}
