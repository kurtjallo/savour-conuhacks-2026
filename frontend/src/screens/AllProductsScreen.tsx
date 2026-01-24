import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCategories, resolveImageUrl } from '../lib/api';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';

export default function AllProductsScreen() {
  const navigate = useNavigate();
  const { totalCount } = useBasket();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Unable to load products. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatStoreName = (storeId: string): string => {
    const storeNames: Record<string, string> = {
      'no-frills': 'No Frills',
      'freshco': 'FreshCo',
      'walmart': 'Walmart',
      'loblaws': 'Loblaws',
      'metro': 'Metro',
    };
    return storeNames[storeId] || storeId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-70 transition-opacity duration-200"
            >
              <h1 className="text-xl font-semibold tracking-wide text-charcoal">
                Savour
              </h1>
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm">Loading products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-70 transition-opacity duration-200"
            >
              <h1 className="text-xl font-semibold tracking-wide text-charcoal">
                Savour
              </h1>
            </button>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm text-charcoal-light hover:text-charcoal transition-colors rounded-lg"
              >
                Home
              </Link>
              <span className="px-3 py-1.5 text-sm font-medium text-charcoal bg-white rounded-lg shadow-sm">
                All Products
              </span>
            </nav>
          </div>

          <button
            onClick={() => navigate('/basket')}
            className="relative p-2.5 -mr-2.5 rounded-lg hover:bg-white/50 transition-colors duration-200"
            aria-label={`View basket with ${totalCount} items`}
          >
            <svg
              className="w-5 h-5 text-charcoal"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-accent rounded-full">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-charcoal tracking-tight mb-2">
            All Products
          </h2>
          <p className="text-charcoal-light">
            Compare prices across {categories.length} products at Canadian grocery stores
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-5 bg-white border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-charcoal">{error}</p>
              <button
                onClick={fetchCategories}
                className="text-accent font-medium hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.category_id}
                onClick={() => navigate(`/category/${category.category_id}`)}
                className="bg-white rounded-2xl border border-border cursor-pointer
                           hover:-translate-y-1 hover:shadow-lift
                           transition-all duration-300 ease-out overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Product Image */}
                {category.image_url ? (
                  <div className="w-full h-48 bg-gray-50 overflow-hidden">
                    <img
                      src={resolveImageUrl(category.image_url)}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                    <span className="text-6xl opacity-50">{category.icon}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Product Name & Unit */}
                  <h3 className="text-lg font-medium text-charcoal mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    {category.unit}
                  </p>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-semibold text-charcoal">
                      {formatPrice(category.cheapest_price)}
                    </span>
                    {category.previous_price && category.previous_price > category.cheapest_price && (
                      <span className="text-base text-muted line-through">
                        {formatPrice(category.previous_price)}
                      </span>
                    )}
                  </div>

                  {/* Store & Savings */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-light">
                      at {formatStoreName(category.cheapest_store)}
                    </span>
                    {category.previous_price && category.previous_price > category.cheapest_price && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-sage bg-sage-light rounded-full">
                        Save {Math.round(((category.previous_price - category.cheapest_price) / category.previous_price) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-charcoal mb-2">
                No products available
              </h3>
              <p className="text-charcoal-light">
                Please check back later
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
