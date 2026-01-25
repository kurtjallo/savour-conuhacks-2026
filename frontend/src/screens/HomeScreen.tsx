import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import QuickAddButton from '../components/QuickAddButton';
import StoreLogo from '../components/StoreLogo';
import { getCategories } from '../lib/api';
import { resolveImageUrl } from '../lib/api';
import type { Category } from '../lib/types';
import { getCategoryColor } from '../lib/icons';

// Category tiles for browsing - using colored dots for professional look
const BROWSE_CATEGORIES = [
  { id: 'produce', name: 'Fruits & Vegetables', color: '#22c55e', keywords: ['apple', 'banana', 'tomato', 'potato', 'onion', 'carrot', 'lettuce', 'broccoli', 'pepper', 'cucumber'] },
  { id: 'dairy', name: 'Dairy & Eggs', color: '#3b82f6', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'] },
  { id: 'meat', name: 'Meat & Seafood', color: '#ef4444', keywords: ['chicken', 'beef', 'pork', 'salmon', 'bacon', 'sausage', 'ground'] },
  { id: 'bakery', name: 'Bread & Bakery', color: '#f59e0b', keywords: ['bread', 'bagel', 'bun', 'muffin', 'tortilla'] },
  { id: 'pantry', name: 'Pantry Staples', color: '#f97316', keywords: ['rice', 'pasta', 'flour', 'sugar', 'oil', 'cereal', 'oat', 'coffee', 'tea'] },
  { id: 'frozen', name: 'Frozen Foods', color: '#06b6d4', keywords: ['frozen', 'ice cream', 'pizza'] },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Calculate savings stats
  const savingsStats = useMemo(() => {
    if (categories.length === 0) return null;

    let totalSavings = 0;
    let maxSavingsPercent = 0;
    let productsWithSavings = 0;

    categories.forEach(cat => {
      if (cat.most_expensive_price > cat.cheapest_price) {
        const savings = cat.most_expensive_price - cat.cheapest_price;
        const savingsPercent = (savings / cat.most_expensive_price) * 100;
        totalSavings += savings;
        productsWithSavings++;
        if (savingsPercent > maxSavingsPercent) {
          maxSavingsPercent = savingsPercent;
        }
      }
    });

    return {
      avgSavings: productsWithSavings > 0 ? totalSavings / productsWithSavings : 0,
      maxSavingsPercent: Math.round(maxSavingsPercent),
      productsCompared: categories.length,
    };
  }, [categories]);

  // Get top deals (highest savings percentage) - max 10 items
  const topDeals = useMemo(() => {
    return [...categories]
      .filter(cat => cat.most_expensive_price > cat.cheapest_price)
      .map(cat => ({
        ...cat,
        savingsPercent: Math.round(((cat.most_expensive_price - cat.cheapest_price) / cat.most_expensive_price) * 100),
        savingsAmount: cat.most_expensive_price - cat.cheapest_price,
      }))
      .sort((a, b) => b.savingsPercent - a.savingsPercent)
      .slice(0, 10);
  }, [categories]);

  // Get products by category - max 10 items for horizontal scroll
  const getProductsByCategory = (keywords: string[]) => {
    return categories.filter(cat => {
      const name = cat.name.toLowerCase();
      return keywords.some(keyword => name.includes(keyword));
    }).slice(0, 10);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm font-ui">Loading deals...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section - More compact */}
        <section className="py-10 md:py-14 text-center animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-3 font-display">
            Compare. Save. Savour.
          </h1>
          <p className="text-charcoal-light text-base md:text-lg font-light max-w-md mx-auto mb-6 font-ui">
            Find the best grocery prices across Canadian stores
          </p>

          {/* Search Bar - Prominent */}
          <div className="max-w-xl mx-auto mb-6">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Search for groceries..."
            />
          </div>
        </section>

        {/* Stats Banner - Clean inline style */}
        {savingsStats && (
          <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-center gap-6 md:gap-10">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-charcoal font-display">
                  {savingsStats.productsCompared.toLocaleString()}+
                </p>
                <p className="text-xs text-muted font-ui">Products</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-accent font-display">
                  {savingsStats.maxSavingsPercent}%
                </p>
                <p className="text-xs text-muted font-ui">Max Savings</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-charcoal font-display">5</p>
                <p className="text-xs text-muted font-ui">Stores</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center hidden sm:block">
                <p className="text-xl md:text-2xl font-bold text-sage font-display">Live</p>
                <p className="text-xs text-muted font-ui">Prices</p>
              </div>
            </div>
          </section>
        )}

        {/* Top Deals Section */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-charcoal font-display">
                Top Deals
              </h2>
              <p className="text-sm text-charcoal-light font-ui">Best savings right now</p>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors font-ui"
            >
              View all
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div className="scroll-container">
            <div className="product-scroll-row">
              {topDeals.map((deal, index) => (
                <div
                  key={deal.category_id}
                  onClick={() => navigate(`/category/${deal.category_id}`)}
                  className="product-scroll-card relative bg-white rounded-xl border border-border cursor-pointer
                             hover:-translate-y-1 hover:shadow-lift transition-all duration-300 overflow-hidden group"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  {/* Savings Badge */}
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-accent rounded-full shadow-sm">
                        Save {deal.savingsPercent}%
                      </span>
                    </div>
                    {deal.image_url ? (
                      <div className="w-full h-28 bg-gray-50 overflow-hidden">
                        <img
                          src={resolveImageUrl(deal.image_url)}
                          alt={deal.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-gray-50 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full opacity-30"
                          style={{ backgroundColor: getCategoryColor(deal.category_id) }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-medium text-charcoal line-clamp-2 min-h-[2.5rem] font-display">
                      {deal.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-semibold text-charcoal font-display">
                        {formatPrice(deal.cheapest_price)}
                      </span>
                      <span className="text-xs text-muted line-through">
                        {formatPrice(deal.most_expensive_price)}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-light mt-1 font-ui flex items-center gap-1">
                      at <StoreLogo storeId={deal.cheapest_store} />
                    </p>
                  </div>

                  {/* Quick Add Button */}
                  <div className="absolute bottom-3 right-3 opacity-70 group-hover:opacity-100
                                  md:opacity-0 md:group-hover:opacity-100
                                  transition-opacity duration-200">
                    <QuickAddButton category={deal} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-semibold text-charcoal font-display">
              Browse by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {BROWSE_CATEGORIES.map((category, index) => {
              const products = getProductsByCategory(category.keywords);
              return (
                <div
                  key={category.id}
                  onClick={() => navigate(`/products?category=${category.id}`)}
                  className="bg-white rounded-xl border border-border p-4 cursor-pointer
                             hover:-translate-y-1 hover:shadow-lift hover:border-accent/30
                             transition-all duration-300 text-center group"
                  style={{ animationDelay: `${250 + index * 30}ms` }}
                >
                  <div className="flex justify-center mb-3">
                    <div
                      className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <h3 className="text-sm font-medium text-charcoal font-display">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 font-ui">
                    {products.length}+ items
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Products by Category */}
        {BROWSE_CATEGORIES.map((category, catIndex) => {
          const products = getProductsByCategory(category.keywords);
          if (products.length === 0) return null;

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-12 animate-fade-in-up"
              style={{ animationDelay: `${300 + catIndex * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <h2 className="text-lg md:text-xl font-semibold text-charcoal font-display">
                    {category.name}
                  </h2>
                </div>
                <Link
                  to={`/products?category=${category.id}`}
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors font-ui"
                >
                  See all
                </Link>
              </div>

              {/* Horizontal scroll row */}
              <div className="scroll-container">
                <div className="product-scroll-row">
                  {products.map((product) => (
                    <div
                      key={product.category_id}
                      onClick={() => navigate(`/category/${product.category_id}`)}
                      className="product-scroll-card relative bg-white rounded-xl border border-border cursor-pointer
                                 hover:-translate-y-1 hover:shadow-lift transition-all duration-300 overflow-hidden group"
                    >
                      {product.image_url ? (
                        <div className="w-full h-28 bg-gray-50 overflow-hidden">
                          <img
                            src={resolveImageUrl(product.image_url)}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-gray-50 flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full opacity-30"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                      )}

                      <div className="p-3">
                        <h3 className="text-sm font-medium text-charcoal line-clamp-1 font-display">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-semibold text-charcoal font-display">
                            {formatPrice(product.cheapest_price)}
                          </span>
                          <span className="text-xs text-charcoal-light font-ui flex items-center">
                            <StoreLogo storeId={product.cheapest_store} />
                          </span>
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <div className="absolute bottom-3 right-3 opacity-70 group-hover:opacity-100
                                      md:opacity-0 md:group-hover:opacity-100
                                      transition-opacity duration-200">
                        <QuickAddButton category={product} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <section className="pb-16 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-charcoal rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 font-display">
              Ready to start saving?
            </h2>
            <p className="text-white/70 mb-6 max-w-md mx-auto font-ui">
              Browse all {categories.length}+ products and build your optimized shopping basket
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-full
                         hover:bg-[#e04d12] hover:shadow-lg transition-all duration-200 font-ui"
              >
                Browse All Products
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/basket"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-full
                         border border-white/20 hover:bg-white/20 transition-all duration-200 font-ui"
              >
                View My Basket
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
