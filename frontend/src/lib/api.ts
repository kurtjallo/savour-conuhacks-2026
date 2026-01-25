import type {
  Store, Category, CategoryDetail, BasketAnalysis, RecipeGenerateResponse,
  Location, RouteSettings, RouteOptimizeResponse, StoreWithLocation
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

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
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || 'Failed to generate recipe';
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function checkRecipeAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/recipes/status`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.available === true;
  } catch {
    return false;
  }
}

export async function optimizeRoute(
  items: { category_id: string; quantity: number }[],
  userLocation: Location,
  settings?: Partial<RouteSettings>
): Promise<RouteOptimizeResponse> {
  const response = await fetch(`${API_BASE}/api/routes/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items,
      user_location: userLocation,
      settings: {
        gas_price_per_liter: settings?.gas_price_per_liter ?? 1.50,
        fuel_efficiency_l_per_100km: settings?.fuel_efficiency_l_per_100km ?? 10.0,
        time_value_per_hour: settings?.time_value_per_hour ?? 15.0,
        time_per_store_minutes: settings?.time_per_store_minutes ?? 30,
      },
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to optimize route');
  }
  return response.json();
}

export async function getStoreLocations(): Promise<StoreWithLocation[]> {
  const response = await fetch(`${API_BASE}/api/stores/locations`);
  if (!response.ok) {
    throw new Error('Failed to fetch store locations');
  }
  const data = await response.json();
  return data.stores;
}
