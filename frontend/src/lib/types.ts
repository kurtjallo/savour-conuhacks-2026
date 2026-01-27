/**
 * Copyright (c) 2026 Savour. All Rights Reserved.
 *
 * This software and associated documentation files are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission from Savour.
 */

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

// --- Route Optimizer Types ---

export interface Location {
  lat: number;
  lng: number;
}

export interface RouteSettings {
  gas_price_per_liter: number;
  fuel_efficiency_l_per_100km: number;
  time_value_per_hour: number;
  time_per_store_minutes: number;
}

export interface StoreWithLocation {
  store_id: string;
  location_id?: string;  // For multi-location support
  name: string;
  color: string;
  address: string;
  lat: number;
  lng: number;
}

export interface StoreVisit {
  store: StoreWithLocation;
  items_to_buy: MultiStoreItem[];
  store_subtotal: number;
  visit_duration_minutes: number;
}

export interface TravelCost {
  total_distance_km: number;
  total_drive_time_minutes: number;
  total_store_time_minutes: number;
  total_trip_time_minutes: number;
  gas_cost: number;
  time_cost: number;
  total_travel_cost: number;
}

export interface RouteOptimizeResponse {
  stores_to_visit: StoreVisit[];
  route_polyline?: string;
  travel_cost: TravelCost;
  grocery_total: number;
  single_store_best_total: number;
  single_store_best_name: string;
  multi_store_total: number;
  grocery_savings: number;
  net_savings: number;
  is_worth_it: boolean;
  recommendation: string;
}
