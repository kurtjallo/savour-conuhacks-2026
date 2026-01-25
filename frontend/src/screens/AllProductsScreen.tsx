import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/api';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';
import ProductGridCard from '../components/ProductGridCard';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-70 transition-opacity duration-200"
            >
              <img
                src="/savourlogo.png"
                alt="Savour"
                className="h-8 w-auto"
              />
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm font-ui">Loading 1000+ products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-70 transition-opacity duration-200"
          >
            <img
              src="/savourlogo.png"
              alt="Savour"
              className="h-8 w-auto"
            />
          </button>

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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header with impressive stats */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-semibold text-charcoal tracking-tight font-display">
              All Products
            </h2>
            <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-white bg-accent rounded-full">
              {categories.length.toLocaleString()} items
            </span>
          </div>
          <p className="text-charcoal-light font-ui">
            Compare prices across <span className="font-semibold text-charcoal">{categories.length.toLocaleString()}</span> products
            at <span className="font-semibold text-charcoal">5 major Canadian grocery stores</span> —
            all with real-time price comparison and savings calculations
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 p-4 bg-gradient-to-r from-sage/10 to-accent/10 rounded-xl border border-sage/20">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-center">
            <div>
              <p className="text-2xl font-bold text-charcoal font-display">{categories.length.toLocaleString()}</p>
              <p className="text-xs text-charcoal-light font-ui">Products</p>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-charcoal font-display">5</p>
              <p className="text-xs text-charcoal-light font-ui">Stores</p>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-accent font-display">{(categories.length * 5).toLocaleString()}</p>
              <p className="text-xs text-charcoal-light font-ui">Price Points</p>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div>
              <p className="text-2xl font-bold text-sage font-display">Real-time</p>
              <p className="text-xs text-charcoal-light font-ui">Comparison</p>
            </div>
          </div>
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

        {/* Products Grid - ALL products with lazy loading */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <ProductGridCard key={category.category_id} category={category} />
              ))}
            </div>

            {/* Bottom stats */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted font-ui">
                Showing all <span className="font-semibold text-charcoal">{categories.length.toLocaleString()}</span> products •
                Powered by lazy loading for optimal performance
              </p>
            </div>
          </>
        ) : (
          !error && (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-charcoal mb-2 font-display">
                No products available
              </h3>
              <p className="text-charcoal-light font-ui">
                Please check back later
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
