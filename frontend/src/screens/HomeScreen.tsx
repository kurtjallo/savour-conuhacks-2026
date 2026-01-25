import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter, { FOOD_CATEGORIES } from '../components/CategoryFilter';
import ProductGridCard from '../components/ProductGridCard';
import { getCategories, searchCategories } from '../lib/api';
import type { Category } from '../lib/types';

const ITEMS_PER_PAGE = 25;

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
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

  // Filter categories based on selected food category filters
  const filterByFoodCategories = useCallback((cats: Category[], filters: string[]): Category[] => {
    if (filters.length === 0) return cats;

    const selectedKeywords = filters.flatMap(filterId => {
      const category = FOOD_CATEGORIES.find(c => c.id === filterId);
      return category ? category.keywords : [];
    });

    return cats.filter(cat => {
      const name = cat.name.toLowerCase();
      const categoryId = cat.category_id.toLowerCase();
      return selectedKeywords.some(keyword =>
        name.includes(keyword) || categoryId.includes(keyword)
      );
    });
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);

      if (!query.trim()) {
        const filtered = filterByFoodCategories(categories, selectedFilters);
        setFilteredCategories(filtered);
        return;
      }

      try {
        const results = await searchCategories(query);
        const filtered = filterByFoodCategories(results, selectedFilters);
        setFilteredCategories(filtered);
      } catch (err) {
        console.error('Search API failed, using local filter:', err);
        const lowerQuery = query.toLowerCase();
        let filtered = categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(lowerQuery) ||
            cat.category_id.toLowerCase().includes(lowerQuery)
        );
        filtered = filterByFoodCategories(filtered, selectedFilters);
        setFilteredCategories(filtered);
      }
    },
    [categories, selectedFilters, filterByFoodCategories]
  );

  const handleFilterChange = useCallback((filters: string[]) => {
    setSelectedFilters(filters);
    setCurrentPage(1);

    let filtered = categories;

    // Apply search query if present
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lowerQuery) ||
          cat.category_id.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply food category filters
    filtered = filterByFoodCategories(filtered, filters);
    setFilteredCategories(filtered);
  }, [categories, searchQuery, filterByFoodCategories]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm font-ui">Loading products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-20 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4 font-display">
            Compare. Save. Savour.
          </h1>
          <p className="text-charcoal-light text-lg font-light max-w-md mx-auto mb-8 font-ui">
            Find the best grocery prices across Canadian stores
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-full
                     hover:bg-[#e04d12] hover:shadow-lg hover:scale-[1.02]
                     transition-all duration-200 ease-out font-ui"
          >
            All Products
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </section>

        {/* Search and Filter */}
        <section className="mb-12 animate-fade-in-up relative z-20" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search groceries..."
              />
            </div>
            <CategoryFilter
              selectedCategories={selectedFilters}
              onChange={handleFilterChange}
            />
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-5 bg-white border border-border rounded-2xl animate-fade-in">
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

        {/* Results Count */}
        {(searchQuery || selectedFilters.length > 0) && (
          <p className="text-sm text-muted mb-6 animate-fade-in font-ui">
            {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedFilters.length > 0 && (
              <span>
                {searchQuery ? ' in ' : ' filtered by '}
                {selectedFilters.map(id => FOOD_CATEGORIES.find(c => c.id === id)?.name).join(', ')}
              </span>
            )}
          </p>
        )}

        {/* Category Grid */}
        {paginatedCategories.length > 0 ? (
          <section className="pb-20 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {paginatedCategories.map((category, index) => (
                <div
                  key={`${category.category_id}-${index}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${150 + index * 30}ms` }}
                >
                  <ProductGridCard category={category} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border bg-white text-charcoal
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:border-charcoal/30 transition-colors"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | 'ellipsis')[] = [];

                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);

                      if (currentPage > 3) {
                        pages.push('ellipsis');
                      }

                      // Show pages around current
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      if (currentPage < totalPages - 2) {
                        pages.push('ellipsis');
                      }

                      // Always show last page
                      pages.push(totalPages);
                    }

                    return pages.map((page, idx) => {
                      if (page === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted select-none">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 font-medium transition-all duration-200
                                    ${currentPage === page
                                      ? 'bg-charcoal text-white rounded-full'
                                      : 'text-charcoal hover:text-charcoal/70'
                                    }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border bg-white text-charcoal
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:border-charcoal/30 transition-colors"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <p className="text-center text-sm text-muted mt-4">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length} products
              </p>
            )}
          </section>
        ) : (
          <section className="text-center py-20 animate-fade-in">
            <h3 className="text-xl font-medium text-charcoal mb-2 font-display">
              No products found
            </h3>
            <p className="text-charcoal-light mb-6 font-ui">
              Try a different search term or filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilters([]);
                setFilteredCategories(categories);
                setCurrentPage(1);
              }}
              className="px-6 py-3 text-accent border border-accent rounded-xl hover:bg-accent hover:text-white transition-all duration-200 font-ui"
            >
              Clear filters
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
