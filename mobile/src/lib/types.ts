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
  cheapest_store: string;
  cheapest_price: number;
  most_expensive_price: number;
  savings_percent: number;
}

export interface DealInfo {
  sale_price: number;
  regular_price: number;
  ends: string; // Date string like "2025-01-31"
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
  unit_qty?: number;
  standard_unit?: string;
  prices: PriceEntry[];
}

export interface BasketItem {
  category_id: string;
  name: string;
  quantity: number;
  prices: Record<string, number>;
  unit: string;
}

export interface StoreTotal {
  store_id: string;
  store_name: string;
  total: number;
  color: string;
}

export interface MultiStoreItem {
  category_id: string;
  name: string;
  store_id: string;
  store_name: string;
  price: number;
  quantity: number;
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
