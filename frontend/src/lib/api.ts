import type { Store, Category, CategoryDetail, BasketAnalysis, RecipeGenerateResponse } from './types';

const API_BASE = "http://localhost:8000";

/**
 * Resolves image URLs - prepends API_BASE to relative URLs (e.g. /static/images/...)
 * while keeping absolute URLs (e.g. https://...) unchanged.
 */
export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // If it's already an absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative URL - prepend API_BASE
  return `${API_BASE}${url}`;
}

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

export async function getCategory(id: string): Promise<CategoryDetail> {
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

export async function generateRecipe(payload: {
  ingredients: string[];
  category_ids?: string[];
  servings?: number;
  cuisine?: string;
  meal_type?: string;
}): Promise<RecipeGenerateResponse> {
  const response = await fetch(`${API_BASE}/api/recipes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category_ids: payload.category_ids ?? [],
      ingredients: payload.ingredients,
      servings: payload.servings ?? 2,
      cuisine: payload.cuisine,
      meal_type: payload.meal_type,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate recipe');
  }
  return response.json();
}
