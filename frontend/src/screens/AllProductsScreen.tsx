import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getCategories, searchCategories } from '../lib/api';
import type { Category } from '../lib/types';
import ProductGridCard from '../components/ProductGridCard';
import CategoryNav from '../components/CategoryNav';
import Header from '../components/Header';

const ITEMS_PER_ROW = 10;

// Category definitions for filtering - using colors for professional look
const BROWSE_CATEGORIES = [
  { id: 'produce', name: 'Fruits & Vegetables', color: '#22c55e', keywords: ['apple', 'banana', 'tomato', 'potato', 'onion', 'carrot', 'lettuce', 'broccoli', 'pepper', 'cucumber', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry', 'avocado', 'spinach', 'kale', 'celery', 'mushroom', 'garlic', 'ginger'] },
  { id: 'dairy', name: 'Dairy & Eggs', color: '#3b82f6', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'sour cream', 'cottage'] },
  { id: 'meat', name: 'Meat & Seafood', color: '#ef4444', keywords: ['chicken', 'beef', 'pork', 'salmon', 'bacon', 'sausage', 'ground', 'steak', 'turkey', 'ham', 'fish', 'shrimp', 'tuna'] },
  { id: 'bakery', name: 'Bread & Bakery', color: '#f59e0b', keywords: ['bread', 'bagel', 'bun', 'muffin', 'tortilla', 'croissant', 'roll', 'pita', 'wrap'] },
  { id: 'pantry', name: 'Pantry Staples', color: '#f97316', keywords: ['rice', 'pasta', 'flour', 'sugar', 'oil', 'cereal', 'oat', 'coffee', 'tea', 'sauce', 'soup', 'bean', 'can', 'spice', 'salt', 'pepper', 'vinegar', 'honey', 'jam', 'peanut butter', 'nutella'] },
  { id: 'frozen', name: 'Frozen Foods', color: '#06b6d4', keywords: ['frozen', 'ice cream', 'pizza', 'fries', 'vegetable frozen', 'dinner'] },
];

// Horizontal Scroll Row Component
function HorizontalScrollRow({
  title,
  color,
  products,
  categoryId,
}: {
  title: string;
  color: string;
  products: Category[];
  categoryId: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: true });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollState({
        left: scrollLeft > 10,
        right: scrollLeft < scrollWidth - clientWidth - 10,
      });
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      handleScroll();
      scrollEl.addEventListener('scroll', handleScroll);
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  if (products.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h2 className="text-lg md:text-xl font-semibold text-charcoal font-display">
            {title}
          </h2>
          <span className="text-sm text-muted font-ui">
            ({products.length} items)
          </span>
        </div>
        <Link
          to={`/products?category=${categoryId}`}
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors font-ui"
        >
          See all
        </Link>
      </div>

      {/* Horizontal Scroll Container with Fade Gradients */}
      <div
        className={`scroll-container ${scrollState.left ? 'scrolled-left' : ''} ${!scrollState.right ? 'scrolled-right' : ''}`}
      >
        <div
          ref={scrollRef}
          className="product-scroll-row"
        >
          {products.slice(0, ITEMS_PER_ROW).map((category) => (
            <div key={category.category_id} className="product-scroll-card">
              <ProductGridCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AllProductsScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use search API if there's a search query, otherwise get all categories
      const data = searchQuery.trim()
        ? await searchCategories(searchQuery.trim())
        : await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Unable to load products. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter by category (when a specific category is selected)
  const filteredCategories = useMemo(() => {
    if (!categoryFilter) return categories;

    const categoryDef = BROWSE_CATEGORIES.find((c) => c.id === categoryFilter);
    if (!categoryDef) return categories;

    return categories.filter((cat) => {
      const name = cat.name.toLowerCase();
      return categoryDef.keywords.some((keyword) => name.includes(keyword));
    });
  }, [categories, categoryFilter]);

  // Group products by category for display (when no filter is applied)
  const productsByCategory = useMemo(() => {
    if (categoryFilter || searchQuery) return null;

    return BROWSE_CATEGORIES.map((cat) => {
      const products = categories.filter((item) => {
        const name = item.name.toLowerCase();
        return cat.keywords.some((keyword) => name.includes(keyword));
      });
      return {
        ...cat,
        products,
      };
    });
  }, [categories, categoryFilter, searchQuery]);

  // Handle category navigation click
  const handleCategoryClick = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryFilter === categoryId) {
      // Toggle off if clicking same category
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    // Clear search when filtering by category
    newParams.delete('search');
    setSearchParams(newParams);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm font-ui">
              {searchQuery ? `Searching for "${searchQuery}"...` : 'Loading 1000+ products...'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <Header />
      <CategoryNav
        categories={BROWSE_CATEGORIES}
        activeCategory={categoryFilter || null}
        onCategoryClick={handleCategoryClick}
        showAllOption={true}
        onAllClick={() => navigate('/products')}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header with impressive stats */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-semibold text-charcoal tracking-tight font-display">
              {categoryFilter
                ? BROWSE_CATEGORIES.find((c) => c.id === categoryFilter)?.name || 'All Products'
                : searchQuery
                ? `Search: "${searchQuery}"`
                : 'All Products'}
            </h2>
            <span className="inline-flex items-center px-3 py-1 text-sm font-bold text-white bg-accent rounded-full">
              {(categoryFilter || searchQuery ? filteredCategories.length : categories.length).toLocaleString()} {(categoryFilter || searchQuery ? filteredCategories.length : categories.length) === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-charcoal-light font-ui">
            {categoryFilter ? (
              <>
                Showing <span className="font-semibold text-charcoal">{filteredCategories.length.toLocaleString()}</span> products
                {' '}in this category across <span className="font-semibold text-charcoal">5 major Canadian grocery stores</span>
              </>
            ) : searchQuery ? (
              <>
                Found <span className="font-semibold text-charcoal">{filteredCategories.length.toLocaleString()}</span> matching products
                {' '}across <span className="font-semibold text-charcoal">5 major Canadian grocery stores</span>
              </>
            ) : (
              <>
                Compare prices across <span className="font-semibold text-charcoal">{categories.length.toLocaleString()}</span> products
                {' '}at <span className="font-semibold text-charcoal">5 major Canadian grocery stores</span>
              </>
            )}
          </p>
          {(searchQuery || categoryFilter) && (
            <button
              onClick={() => navigate('/products')}
              className="mt-3 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              {categoryFilter ? 'Clear filter and view all products' : 'Clear search and view all products'}
            </button>
          )}
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

        {/* Products Display */}
        {(categoryFilter || searchQuery) ? (
          // Show filtered products in horizontal scroll rows (max 10 per row)
          filteredCategories.length > 0 ? (
            <div className="space-y-10">
              {(() => {
                // Split into rows of 10
                const rows: Category[][] = [];
                for (let i = 0; i < filteredCategories.length; i += ITEMS_PER_ROW) {
                  rows.push(filteredCategories.slice(i, i + ITEMS_PER_ROW));
                }
                return rows.map((row, rowIndex) => (
                  <section key={rowIndex} className="mb-6">
                    {rowIndex === 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: BROWSE_CATEGORIES.find(c => c.id === categoryFilter)?.color || '#6b7280' }}
                        />
                        <h2 className="text-lg md:text-xl font-semibold text-charcoal font-display">
                          {categoryFilter
                            ? BROWSE_CATEGORIES.find(c => c.id === categoryFilter)?.name
                            : searchQuery
                            ? `Results for "${searchQuery}"`
                            : 'Products'}
                        </h2>
                      </div>
                    )}
                    <div className="scroll-container">
                      <div className="product-scroll-row">
                        {row.map((category) => (
                          <div key={category.category_id} className="product-scroll-card">
                            <ProductGridCard category={category} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                ));
              })()}
            </div>
          ) : (
            !error && (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium text-charcoal mb-2 font-display">
                  No products found
                </h3>
                <p className="text-charcoal-light font-ui">
                  Try a different search or category
                </p>
              </div>
            )
          )
        ) : (
          // Show products grouped by category with horizontal scroll rows
          productsByCategory && productsByCategory.some(cat => cat.products.length > 0) ? (
            <div className="space-y-2">
              {productsByCategory.map((cat) => (
                <HorizontalScrollRow
                  key={cat.id}
                  title={cat.name}
                  color={cat.color}
                  products={cat.products}
                  categoryId={cat.id}
                />
              ))}
            </div>
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
          )
        )}
      </main>
    </div>
  );
}
