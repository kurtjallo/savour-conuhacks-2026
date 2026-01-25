import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { CategoryDetail, PriceEntry } from '../lib/types';
import { getCategory } from '../lib/api';
import PriceTable from '../components/PriceTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import AddToBasket from '../components/AddToBasket';
import { useBasket } from '../context/BasketContext';

export default function CategoryScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { totalCount } = useBasket();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedPrices = useMemo<PriceEntry[]>(() => {
    if (!category) {
      return [];
    }
    return [...category.prices].sort((a, b) => a.price - b.price);
  }, [category]);

  const bestPrice = sortedPrices[0];
  const availabilityText = category?.availability
    ? category.availability
    : sortedPrices.length > 0
      ? `Available at ${sortedPrices.length} retailer${sortedPrices.length === 1 ? '' : 's'}`
      : 'Currently unavailable';

  const descriptionText = category?.description
    ? category.description
    : category
      ? `Compare ${category.name} pricing across Canadian grocers and add it to your cart in one tap.`
      : '';

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError('Category ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const categoryData = await getCategory(id);
        setCategory(categoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-savour-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-savour-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-savour-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-savour-bg flex items-center justify-center p-6">
        <div className="bg-white border border-savour-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-savour-text mb-2">Something went wrong</h2>
          <p className="text-savour-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-savour-accent text-white font-medium rounded-xl hover:bg-savour-accent-hover transition-colors"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  // No category found
  if (!category) {
    return (
      <div className="min-h-screen bg-savour-bg flex items-center justify-center p-6">
        <div className="bg-white border border-savour-border rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-savour-text-secondary mb-6">Category not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-savour-accent text-white font-medium rounded-xl hover:bg-savour-accent-hover transition-colors"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-savour-bg">
      {/* Header */}
      <header className="bg-white border-b border-savour-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-savour-text-secondary hover:text-savour-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>

          <Link
            to="/basket"
            className="flex items-center gap-2 px-4 py-2 text-savour-text-secondary hover:text-savour-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalCount > 0 && (
              <span className="text-sm font-medium">{totalCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Category Header */}
        <div className="mb-10 text-center">
          {/* Product Image or Icon */}
          {category.image_url ? (
            <div className="w-44 h-44 mx-auto mb-6 bg-white rounded-2xl shadow-md overflow-hidden border border-savour-border hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-44 h-44 object-cover"
              />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-savour-border shadow-md">
              <span className="text-7xl">{category.icon}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-savour-text tracking-tight mb-1">{category.name}</h1>
          <p className="text-savour-text-secondary text-sm">per {category.unit}</p>
        </div>

        {/* Item Details Summary */}
        <div className="bg-white border border-savour-border rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-savour-savings text-white">
                    Best Price
                  </span>
                </div>
                <p className="text-3xl font-bold text-savour-savings">
                  {bestPrice ? formatPrice(bestPrice.price) : 'N/A'}
                </p>
                {bestPrice && (
                  <p className="text-sm text-savour-text-secondary mt-1">
                    at <span className="font-medium text-savour-text">{bestPrice.store_name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-savour-text-secondary border border-gray-200">
                  <svg className="w-3.5 h-3.5 mr-1.5 text-savour-savings" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {availabilityText}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-savour-border">
              <p className="text-xs uppercase tracking-wide text-savour-text-secondary mb-2">About this product</p>
              <p className="text-savour-text text-sm leading-relaxed">{descriptionText}</p>
            </div>
          </div>
        </div>

        {/* Price Comparison Section */}
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-savour-text mb-0.5">Price Comparison</h2>
              <p className="text-savour-text-secondary text-sm">across 5 Canadian retailers</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-savour-text-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Sorted by price</span>
            </div>
          </div>
          <PriceTable prices={sortedPrices} unit={category.unit} />
        </div>

        {/* Price History Chart */}
        {bestPrice && (
          <div className="mb-10">
            <PriceHistoryChart currentPrice={bestPrice.price} productId={category.category_id} />
          </div>
        )}

        {/* Add to Basket Section */}
        <AddToBasket category={category} bestPrice={bestPrice?.price} />

        {/* Quick Navigation */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/products"
            className="text-savour-text-secondary hover:text-savour-accent text-sm flex items-center gap-2 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Browse more products
          </Link>
        </div>
      </main>
    </div>
  );
}
