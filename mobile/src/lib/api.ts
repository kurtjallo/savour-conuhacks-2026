import { Category, CategoryDetail, Store, BasketAnalysis } from './types';

// API Configuration:
// - Simulator: Can use http://localhost:8000 or http://YOUR_IP:8000
// - Physical device (Expo Go): MUST use HTTPS (ngrok tunnel)
//   Run: ngrok http 8000
//   Then set: EXPO_PUBLIC_API_URL=https://YOUR-NGROK-URL.ngrok-free.app
//
// Note: Expo Go ignores ATS exceptions in app.json, so HTTPS is required
// for physical iOS devices. Use a development build (expo-dev-client) if
// you need custom ATS settings without ngrok.
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function getStores(): Promise<Store[]> {
  const res = await fetch(`${API_BASE}/api/stores`);
  if (!res.ok) throw new Error('Failed to fetch stores');
  const data = await res.json();
  return data.stores;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories;
}

export async function searchCategories(query: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/api/categories/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search categories');
  const data = await res.json();
  return data.categories;
}

export async function getCategory(id: string): Promise<CategoryDetail> {
  const res = await fetch(`${API_BASE}/api/categories/${id}`);
  if (!res.ok) throw new Error('Category not found');
  return res.json();
}

export async function analyzeBasket(items: { category_id: string; quantity: number }[]): Promise<BasketAnalysis> {
  const res = await fetch(`${API_BASE}/api/basket/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Failed to analyze basket');
  return res.json();
}

export { API_BASE };
