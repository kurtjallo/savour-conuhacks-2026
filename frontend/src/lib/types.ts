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
  image_url?: string;
  prices: Record<string, number>;
  cheapest_store: string;
  cheapest_price: number;
  most_expensive_store: string;
  most_expensive_price: number;
  previous_price?: number;
  description?: string;
  availability?: string;
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
  store_id: string;
  store_name: string;
  price: number;
  color: string;
}

export interface BasketAnalysis {
  single_store_best: StoreTotal;
  single_store_worst: StoreTotal;
  multi_store_optimal: MultiStoreItem[];
  multi_store_total: number;
  savings_vs_worst: number;
  savings_percent: number;
  annual_projection: number;
}

export interface DealInfo {
  sale_price: number;
  regular_price: number;
  ends: string;
}

export interface PriceEntry {
  store_id: string;
  store_name: string;
  price: number;
  color: string;
  deal?: DealInfo;
}

export interface CategoryDetail {
  category_id: string;
  name: string;
  icon: string;
  unit: string;
  image_url?: string;
  unit_qty?: number;
  standard_unit?: string;
  previous_price?: number;
  prices: PriceEntry[];
  description?: string;
  availability?: string;
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
