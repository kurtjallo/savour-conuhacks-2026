import type { Store, Category, BasketAnalysis } from './types';

const API_BASE = "http://localhost:8000";

export async function getStores(): Promise<Store[]> {
  const response = await fetch(`${API_BASE}/api/stores`);
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/api/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.categories || data;
}

export async function searchCategories(q: string): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/api/categories/search?q=${encodeURIComponent(q)}`);
  if (!response.ok) {
    throw new Error('Failed to search categories');
  }
  const data = await response.json();
  return data.categories || data;
}

export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_BASE}/api/categories/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  return response.json();
}

export async function analyzeBasket(
  items: { category_id: string; quantity: number }[]
): Promise<BasketAnalysis> {
  const response = await fetch(`${API_BASE}/api/basket/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error('Failed to analyze basket');
  }
  return response.json();
}
