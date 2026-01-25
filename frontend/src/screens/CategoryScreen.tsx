import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { CategoryDetail, PriceEntry } from '../lib/types';
import { getCategory, resolveImageUrl } from '../lib/api';
import { getCategoryColorFromName } from '../lib/icons';
import Header from '../components/Header';
import PriceTable from '../components/PriceTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import AddToBasket from '../components/AddToBasket';

export default function CategoryScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sortedPrices = useMemo<PriceEntry[]>(() => {
    if (!category) {
      return [];
    }
    return [...category.prices].sort((a, b) => a.price - b.price);
  }, [category]);

  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];

  // Calculate savings percentage
  const savingsPercent = useMemo(() => {
    if (bestPrice && worstPrice && worstPrice.price > bestPrice.price) {
      return Math.round(((worstPrice.price - bestPrice.price) / worstPrice.price) * 100);
    }
    return 0;
  }, [bestPrice, worstPrice]);

  const savingsAmount = useMemo(() => {
    if (bestPrice && worstPrice) {
      return worstPrice.price - bestPrice.price;
    }
    return 0;
  }, [bestPrice, worstPrice]);

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
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm font-sans">Loading product...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20">
          <div className="bg-white border border-border rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2 font-display">Something went wrong</h2>
            <p className="text-charcoal-light text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-all duration-200"
            >
              Return home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // No category found
  if (!category) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20">
          <div className="bg-white border border-border rounded-2xl p-8 text-center animate-fade-in-up">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2 font-display">Product not found</h2>
            <p className="text-charcoal-light text-sm mb-6">We couldn't find the product you're looking for.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition-all duration-200"
            >
              Return home
            </button>
          </div>
        </main>
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
    <div className="min-h-screen bg-cream pb-32 md:pb-10">
      {/* Shared Header with search bar */}
      <Header />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-charcoal-light hover:text-accent transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to products</span>
          </button>
        </nav>

        {/* Product Hero Section */}
        <section className="mb-8 animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-subtle">
            {/* Product Image */}
            <div className="relative">
              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-bold text-white bg-accent rounded-full shadow-md">
                    Save {savingsPercent}%
                  </span>
                </div>
              )}

              {/* Availability Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-charcoal-light border border-border shadow-sm">
                  <svg className="w-3.5 h-3.5 text-sage" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {availabilityText}
                </span>
              </div>

              {/* Image Container */}
              <div className="relative w-full aspect-square bg-gray-50 max-h-80 overflow-hidden">
                {/* Skeleton placeholder */}
                {!imageLoaded && category.image_url && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                )}

                {category.image_url ? (
                  <img
                    src={resolveImageUrl(category.image_url)}
                    alt={category.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-contain p-6 transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full opacity-30"
                      style={{ backgroundColor: getCategoryColorFromName(category.name) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight mb-1 font-display">
                  {category.name}
                </h1>
                <p className="text-charcoal-light text-sm">per {category.unit}</p>
              </div>

              {/* Description */}
              <p className="text-charcoal-light text-sm leading-relaxed">{descriptionText}</p>
            </div>
          </div>
        </section>

        {/* Best Price Card */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="bg-gradient-to-br from-sage-light to-sage/10 rounded-2xl border border-sage/20 p-6 shadow-subtle">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-sage text-white">
                    Best Price
                  </span>
                </div>
                <p className="text-4xl font-bold text-sage mb-1 font-display">
                  {bestPrice ? formatPrice(bestPrice.price) : 'N/A'}
                </p>
                {bestPrice && (
                  <p className="text-sm text-charcoal-light">
                    at <span className="font-semibold text-charcoal">{bestPrice.store_name}</span>
                  </p>
                )}
              </div>

              {/* Savings Info */}
              {savingsAmount > 0 && (
                <div className="text-right">
                  <p className="text-xs text-charcoal-light mb-1">You save</p>
                  <p className="text-xl font-bold text-sage font-display">{formatPrice(savingsAmount)}</p>
                  <p className="text-xs text-charcoal-light">vs highest price</p>
                </div>
              )}
            </div>

            {/* Price Range Indicator */}
            {worstPrice && bestPrice && worstPrice.price > bestPrice.price && (
              <div className="mt-4 pt-4 border-t border-sage/20">
                <div className="flex items-center justify-between text-xs text-charcoal-light mb-2">
                  <span>Price range across stores</span>
                  <span>{formatPrice(bestPrice.price)} - {formatPrice(worstPrice.price)}</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sage to-sage/60 rounded-full transition-all duration-500"
                    style={{ width: `${100 - savingsPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Price Comparison Section */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-charcoal mb-0.5 font-display">Price Comparison</h2>
              <p className="text-charcoal-light text-sm">across {sortedPrices.length} Canadian retailers</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-light bg-white px-3 py-1.5 rounded-full border border-border">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Sorted by price</span>
            </div>
          </div>
          <PriceTable prices={sortedPrices} unit={category.unit} />
        </section>

        {/* Price History Chart */}
        {bestPrice && (
          <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <PriceHistoryChart currentPrice={bestPrice.price} productId={category.category_id} />
          </section>
        )}

        {/* Add to Basket Section - Desktop */}
        <section className="hidden md:block animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <AddToBasket category={category} bestPrice={bestPrice?.price} />
        </section>

        {/* Quick Navigation */}
        <div className="mt-10 flex justify-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <Link
            to="/products"
            className="text-charcoal-light hover:text-accent text-sm flex items-center gap-2 transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Sticky Add to Basket - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border shadow-lift z-40 p-4 animate-fade-in-up">
        <div className="max-w-2xl mx-auto">
          <AddToBasket category={category} bestPrice={bestPrice?.price} compact />
        </div>
      </div>
    </div>
  );
}
