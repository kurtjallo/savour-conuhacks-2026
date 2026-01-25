import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../lib/api';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';
import ProductGridCard from '../components/ProductGridCard';

const ITEMS_PER_PAGE = 40;

export default function AllProductsScreen() {
  const navigate = useNavigate();
  const { totalCount } = useBasket();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
      setCurrentPage(1);
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

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <p className="text-charcoal-light text-sm font-ui">Loading products...</p>
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
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-charcoal tracking-tight mb-2 font-display">
            All Products
          </h2>
          <p className="text-charcoal-light font-ui">
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
        {paginatedCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedCategories.map((category, index) => (
              <div
                key={category.category_id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
              >
                <ProductGridCard category={category} />
              </div>
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
        )}

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
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('ellipsis');
                  }

                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('ellipsis');
                  }

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
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} of {categories.length} products
          </p>
        )}
      </main>
    </div>
  );
}
